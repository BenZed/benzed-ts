
import {
    isSymbol,
    Pipe,

    nil,
    provide,
    isFunc,
} from '@benzed/util'

import {
    $$id,
    $$mainId,
    defineMainValidatorId,
    defineSymbol
} from './util/symbols'

import {
    AnyValidate, 
    Validate, 
    ValidateOptions,
    ValidateContext,

    Validator,
    ValidatorSettings, 
    AllowedValidatorSettings,

    ValidationErrorMessage,
} from './validator'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper ////

const withId = provide((id?: string | symbol) => (validator: AnyValidate) => resolveSubvalidatorId(validator) === id)

function resolveSubvalidatorId(
    input: object
): symbol | nil {

    // resolve id
    const id = $$id in input ? input[$$id] : nil
    if (id !== nil && !isSymbol(id))
        throw new Error('Invalid sub validator id value.')

    return id
}

function assertSubvalidatorId(
    input: object
): string | symbol {
    const id = resolveSubvalidatorId(input)
    if (!id)
        throw new Error('Input did not have an id')

    return id
}

function spliceValidator<I, O, V extends Validator<O,O>>(
    input: AbstractSchema<I,O>,
    validator?: V,
    find?: (validator: Validators<I,O>[number], index: number) => boolean
): AbstractSchema<I,O> { 

    const validators = Array.from(input)

    const index = find ? validators.findIndex(find) : -1

    const hasExisting = index >= 0
    if (hasExisting && validator)
        validators.splice(index, 1, validator)

    else if (hasExisting)
        validators.splice(index, 1)

    else if (!hasExisting && validator)
        validators.push(validator)

    assertMainValidatorIndex(validators)

    const validate = Validator.merge(...validators)

    // update state
    return Validator.apply(input, { validate })
}

function assertMainValidatorIndex<I,O>(
    input: Iterable<Validators<I,O>[number]>
): void {
    const validators = Array.from(input)
    const index = validators.findIndex(withId($$mainId))
    if (index !== 0)
        throw new Error(`main validator at invalid index: ${index}`)
}

function schemaValidate <I,O>(
    this: { validate: Validate<I, O> }, 
    i: I, 
    options?: Partial<ValidateOptions>
): O {
    const ctx = new ValidateContext(i, options)
    return this.validate(i, ctx)
}

//// Validators ////

type Validators<I,O> = [mainValidator: Validate<I,O>, ...genericValidators: Validate<O,O>[]]

type UpdateValidatorSettings<I,O> = AllowedValidatorSettings<ValidatorSettings<I,O>>

//// Schema ////

abstract class AbstractSchema<I, O = I> extends Validate<I,O> {

    constructor(settings: ValidatorSettings<I,O> | Validate<I,O>) {
        super(schemaValidate)

        const validator = Validator.from(settings)

        if ($$id in validator)
            defineSymbol(this, $$id, validator[$$id])

        this.validate = defineMainValidatorId(validator) as Validate<I,O>
    }

    readonly validate: Validate<I,O>

    //// Main Validator Interface ////
    
    override get name(): string {
        const [ mainValidator ] = this.validators
        return mainValidator.name || Validator.name.toLowerCase()
    }
    
    /**
     * Change the name of the main validator
     */
    named(name: string): this {
        return this._updateMainValidator({ name }) 
    }
        
    /**
     * Change the thrown error
     */
    error(error: string | ValidationErrorMessage<I>): this {
        return this._updateMainValidator({ error })
    }

    //// Validator Manipulation Interface ////

    protected _removeValidator(
        id: symbol
    ): this {
        if (id === $$mainId)
            throw new Error('Cannot remove the main validator')

        return spliceValidator(this, nil, withId(id)) as this
    }

    protected _upsertValidator(
        input: Partial<ValidatorSettings<O,O>> | Validate<O>,
        id?: symbol
    ): this {
        const validator = Validator.from(input) as Validator<O>

        if (!id) 
            id = resolveSubvalidatorId(validator) as symbol

        if (id)
            defineSymbol(validator, $$id, id)

        return spliceValidator(this, validator, withId(id)) as this
    }
    
    protected _updateValidator(
        id: symbol,
        validator: UpdateValidatorSettings<O,O> | Validate<O,O>
    ): this {
        const oldValidator = Array.from(this).find(withId(id))
        if (!oldValidator)
            throw new Error(`No validator for id: ${String(id)}`)
    
        const newValidator = isFunc(validator) 
            ? validator 
            : Validator.apply(oldValidator, validator)
        
        return this._upsertValidator(newValidator as Validate<O,O>, id)
    }

    protected _updateMainValidator<V extends UpdateValidatorSettings<I,O>>(settings: V): this {
        return this._updateValidator($$mainId, settings as UpdateValidatorSettings<O,O>)
    }

    //// Iteration ////
    
    *[Symbol.iterator](): IterableIterator<Validators<I,O>[number]> {
        yield* (this.validate instanceof Pipe 
            ? this.validate.transforms
            : [this.validate]) as Iterable<Validators<I,O>[number]>
    }

    get validators(): Validators<I,O> {
        return [...this] as Validators<I,O>
    }

}

//// Exports ////

export default AbstractSchema 

export { 
    AbstractSchema,
    Validators,
    resolveSubvalidatorId,
    assertSubvalidatorId,
} 