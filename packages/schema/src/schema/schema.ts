
import { pluck } from '@benzed/array'
import { $$copy, copy, sort } from '@benzed/immutable'
import {
    isFunc,
    isString,
    isSymbol,

    keysOf,

    ParamPipe,
    Pipe,
    Property,

    nil,
    omit,
    provide,
    defined
} from '@benzed/util'
import { $$id, $$mainId, $$subConfig, defineSymbol } from '../symbols'

import {
    AnyValidatorSettings, 
    ValidateContext, 

    ValidationErrorInput, 
    Validator, 

    ValidatorPredicate, 
    ValidatorSettings, 
    ValidatorTransform, 
    VALIDATOR_DISALLOWED_SETTINGS_KEYS
} from '../validator'

import {
    AnyValidate, 
    Validate, 
    ValidateOptions
} from '../validator/validate'

import { createAccessors } from './create-accessors'

import { 
    AnySchema,
    SchemaConstructor, 
    SchemaProperties, 
    SchemaSetters, 
    SchemaSettingsInput,
    SchemaSettingsOutput
} from './schema-types'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Symbol ////

//// Type ////

type Schema<I, O, T extends SchemaSettingsInput<O> | ValidatorSettings<I,O>> = 
    SchemaProperties<I, O, T> & 
    SchemaSetters<I,O,T>

type ValidatorPipe<I, O> = ParamPipe<I, O, [options?: Partial<ValidateOptions>]>

type AnyValidatorPipe = ValidatorPipe<unknown,unknown> 

//// Helper ////

function resolveId(
    input: object
): string | symbol | nil {

    // resolve id
    const id = $$id in input ? input[$$id] : nil
    if (id && !isString(id) && !isSymbol(id))
        throw new Error('Invalid sub validator id value.')

    return id as string | symbol | nil
}

function sortIdErrorArgs(
    args: [error?: ValidationErrorInput<unknown>, id?: symbol] | [id?: symbol]
): { 
        error?: ValidationErrorInput<unknown> 
        id?: symbol 
    } {
    const [id] = pluck(args, isSymbol) as [symbol?]
    const [error] = args as [ValidationErrorInput<unknown>?]

    return defined({ id, error })
}

function upsertValidator(
    validators: AnyValidate[],
    validator?: AnyValidate,
    find?: (validator: AnyValidate, index: number, validators: AnyValidate[]) => boolean
): AnyValidate[] { 

    const index = find ? validators.findIndex(find) : -1
    const hasExisting = index >= 0

    if (hasExisting && validator)
        validators.splice(index, 1, validator)
    else if (hasExisting)
        validators.splice(index, 1)
    else if (validator)
        validators.push(validator)

    return validators
}

const withId = provide((id?: string | symbol) => (validator: AnyValidate) => resolveId(validator) === id)

const isEnabled = provide((key: string) => (validator: AnyValidate) => $$subConfig in validator && validator[$$subConfig] === key)

function upsertValidators(
    validators: AnyValidate[],
    inputs: (Partial<AnyValidatorSettings> | AnyValidate)[]
): AnyValidatorPipe {

    for (const input of inputs) {

        const validator = isFunc(input) 
            ? input 
            : Validator.from(input)

        const id = resolveId(validator)

        upsertValidator(
            validators, 
            validator, 
            withId(id)
        )
    }

    // merge validators into validate method
    return Pipe.from(
        Validator.merge(...validators)
    )
}

function schemaSettingsOutput(input: object, validators: AnyValidate[]): SchemaSettingsOutput<object> {

    const output = { ...input } as Record<string, object>
    for (const key of keysOf(output)) {
        const isValidator = output[key] instanceof Validate
        const existing = validators.find(isEnabled(key))

        if (isValidator && existing)
            output[key] = schemaSettingsOutput(existing, validators)
    
        else if (isValidator && !existing)
            delete output[key]
    }

    return omit(output, ...VALIDATOR_DISALLOWED_SETTINGS_KEYS)
}

function schemaValidator <I,O>(this: { validate: Validate<I, O> }, i: I, options?: Partial<ValidateOptions>): O {
    const ctx = new ValidateContext(i, options)
    return this.validate(i, ctx)
}

function defineMainValidatorId(validator: AnyValidate): void {
    defineSymbol(validator, $$id, $$mainId)
}

//// Implementation ////

const Schema = class extends Validate<unknown, unknown> {

    static readonly $$id = $$id

    readonly validate: ValidatorPipe<unknown,unknown>

    constructor(settings: object) {
        super(schemaValidator)

        const validator = Validator.from(settings) 
        defineMainValidatorId(validator)
        
        this.validate = Pipe.from(validator)
        createAccessors(this, validator)
    }

    override get name(): string {
        const [ mainValidator ] = this.validators
        return mainValidator.name
    }

    get settings(): SchemaSettingsOutput<object> {
        const [ mainValidator ] = this.validators
        return schemaSettingsOutput(mainValidator, this.validators)
    }

    //// Validation Interface ////
    
    validates(
        input: Partial<AnyValidatorSettings> | AnyValidate,
    ): this {

        const validate = upsertValidators(this.validators, [input])

        // update state
        return Validator.apply(this, { validate } as any)
    }

    asserts(
        isValid: ValidatorPredicate<unknown>,
        ...args: [error?: ValidationErrorInput<unknown>, id?: symbol] | [id?: symbol]
    ): this {
        
        return this.validates({
            isValid,
            ...sortIdErrorArgs(args)
        })
    }

    transforms(
        transform: ValidatorTransform<unknown>,
        ...args: [error?: ValidationErrorInput<unknown>, id?: symbol] | [id?: symbol]
    ): this {
        return this.validates({
            transform,
            ...sortIdErrorArgs(args)
        })
    }

    //// Apply ////
    
    override apply(settings: object): this {

        const [ mainValidator, ...validators ] = this.validators

        const { key: subKey, enabled: subEnabled, construct } = $$subConfig in settings 
            ? settings[$$subConfig] as { key?: string, enabled: boolean, construct?: unknown[] }
            : { key: nil, enabled: true, construct: nil } as const

        const isModifyingSubValidator = subKey !== nil
        if (isModifyingSubValidator) {

            // copy mainValidator
            const newMainValidator = copy(mainValidator as any)
            defineMainValidatorId(newMainValidator)

            const existingSubValidator = validators.find(isEnabled(subKey))

            const newSubValidator = subEnabled 
                ? construct 
                    ? new newMainValidator[subKey](...construct) as AnyValidate
                    : existingSubValidator 
                        ? Validator.apply(existingSubValidator, settings)
                        : Validator.apply(newMainValidator[subKey], settings)
                : nil

            const validatorWithId = existingSubValidator ?? newSubValidator
            
            const id = validatorWithId && $$id in validatorWithId 
                ? validatorWithId[$$id] 
                : subKey

            if (newSubValidator) {
                defineSymbol(newSubValidator, $$subConfig, subKey)
                defineSymbol(newSubValidator, $$id, id)
            }
            upsertValidator(validators, newSubValidator, withId(id)) 

            // upate the schema
            const validate = Pipe.from(newMainValidator, ...validators)
            return Validator.apply(this, { validate } as any)
        } else {

            const newMainValidator = Validator.apply(mainValidator, settings)
            return this.validates(newMainValidator)
        }

    }

    protected [$$copy](): this {
        const clone = super[$$copy]()

        const [ mainValidator ] = this.validators
        createAccessors(clone, mainValidator)

        return clone
    }

    //// Iteration ////

    get validators(): [AnyValidate, ...AnyValidate[]] {

        const validators = this.validate.transforms
        const index = this.validate.transforms.findIndex(v => $$id in v && v[$$id] === $$mainId)
        if (index !== 0)
            throw new Error(`main validator at invalid index: ${index}`)

        return [...validators] as [AnyValidate, ...AnyValidate[]]
    }

    *[Symbol.iterator](): IterableIterator<AnyValidate> {
        yield* (this as { validate: AnyValidatorPipe }).validate.transforms
    }

} as unknown as SchemaConstructor

//// Exports ////

export default Schema 

export { 
    Schema,
    ValidatorPipe,
} 