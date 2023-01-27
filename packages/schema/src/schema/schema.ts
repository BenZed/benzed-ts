
import { $$copy, copy } from '@benzed/immutable'
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
    provide
} from '@benzed/util'
import { $$id, $$mainId, $$subConfig } from '../symbols'

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

function upsertValidators(
    validators: AnyValidate[],
    inputs: (Partial<AnyValidatorSettings> | AnyValidate)[]
): AnyValidatorPipe {

    for (const input of inputs) {

        const id = resolveId(input)

        const validator = isFunc(input) 
            ? input 
            : Validator.from(input)

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
        const isEnabled = validators.some(v => $$subConfig in v && v[$$subConfig] === key)

        if (isValidator && isEnabled)
            output[key] = schemaSettingsOutput(output[key], validators)
        else if (isValidator && !isEnabled)
            delete output[key]
    }

    return omit(output, ...VALIDATOR_DISALLOWED_SETTINGS_KEYS)
}

function schemaValidator <I,O>(this: { validate: Validate<I, O> }, i: I, options?: Partial<ValidateOptions>): O {
    const ctx = new ValidateContext(i, options)
    return this.validate(i, ctx)
}

function defineMainValidatorId(validator: AnyValidate): void {
    Property.define(
        validator, 
        $$id,
        { 
            value: $$mainId, 
            enumerable: false 
        }
    )
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
        input: Partial<AnyValidatorSettings> | AnyValidate
    ): this {

        const validate = upsertValidators(this.validators, [input])

        // update state
        return Validator.apply(this, { validate } as any)
    }

    asserts(
        isValid: ValidatorPredicate<unknown>,
        error?: ValidationErrorInput<unknown>
    ): this {
        return this.validates({
            isValid,
            error
        })
    }

    transforms(
        transform: ValidatorTransform<unknown>,
        error?: ValidationErrorInput<unknown>
    ): this {
        return this.validates({
            transform,
            error
        })
    }

    //// Apply ////
    
    override apply(settings: object): this {

        const [ mainValidator, ...validators ] = this.validators

        const [ subKey, subEnabled ] = $$subConfig in settings 
            ? settings[$$subConfig] as [string, boolean]
            : [nil, false] as const

        const isModifyingSubValidator = subKey !== nil
        if (isModifyingSubValidator) {

            // copy mainValidator
            const newMainValidator = copy(mainValidator as any)
            defineMainValidatorId(newMainValidator)

            // update the subValidator on the mainValidator
            const newSubValidator = Validator.apply(newMainValidator[subKey], settings)
            newMainValidator[subKey] = newSubValidator

            // update the refValidator pointing to the subValidator
            const subValidator = subEnabled
                ? Property.name(function (this: AnySchema, i: unknown, ctx?: ValidateOptions): unknown {
                    const subKey = (subValidator as any)[$$subConfig]
                    const [ mainValidator ] = this.validators
                    return mainValidator[subKey](i, ctx)
                }, `${subKey}SubValidatorRef`) as AnyValidate

                : nil

            const id = $$id in newSubValidator ? newSubValidator[$$id] : subKey
            if (subValidator) {
                Property.define(subValidator, $$subConfig, { value: subKey, enumerable: false })
                Property.define(subValidator, $$id, { value: id, enumerable: false })
            }
                
            upsertValidator(validators, subValidator, withId(id))

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