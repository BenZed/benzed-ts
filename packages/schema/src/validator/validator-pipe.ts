
import { pluck } from '@benzed/array'

import {
    isString,
    isSymbol,
    Pipe,

    nil,
    provide,
    defined,
} from '@benzed/util'

import {
    $$id,
    $$mainId,
    defineMainValidatorId,
    defineSymbol
} from '../symbols'

import {
    Validator, 
    ValidatorPredicate, 
    ValidatorSettings, 
    ValidatorTransform, 
    ValidatorTypeGuard, 
} from './validator'

import {
    AnyValidate, 
    Validate, 
    ValidateOptions
} from './validate'

import { ValidationErrorInput } from './validate-error'

import ValidateContext from './validate-context'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper ////

const withId = provide((id?: string | symbol) => (validator: AnyValidate) => resolveId(validator) === id)

function resolveId(
    input: object
): string | symbol | nil {

    // resolve id
    const id = $$id in input ? input[$$id] : nil
    if (id && !isString(id) && !isSymbol(id))
        throw new Error('Invalid sub validator id value.')

    return id as string | symbol | nil
}

function sortIdErrorArgs<T>(
    args: [error?: ValidationErrorInput<T>, id?: symbol] | [id?: symbol]
): { 
        error?: ValidationErrorInput<T> 
        id?: symbol 
    } {
    const [id] = pluck(args, isSymbol) as [symbol?]
    const [error] = args as [ValidationErrorInput<T>?]

    return defined({ id, error })
}

function spliceValidator<I, O, V extends Validator<O,O>>(
    input: ValidatorPipe<I,O>,
    validator?: V,
    find?: (validator: Validators<I,O>[number], index: number) => boolean
): ValidatorPipe<I,O> { 

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

function validateAll <I,O>(
    this: { validate: Validate<I, O> }, 
    i: I, 
    options?: Partial<ValidateOptions>
): O {
    const ctx = new ValidateContext(i, options)
    return this.validate(i, ctx)
}

//// Types ////

interface ValidatorPipeProperties<I, O> extends Validate<I,O> {
    
    readonly validate: Validate<I,O>

    validates(
        input: Partial<ValidatorSettings<O,O>> | Validate<O>,
        id?: symbol
    ): this 

    asserts(
        isValid: ValidatorPredicate<O>,
        id?: symbol
    ): this 
    asserts(
        isValid: ValidatorPredicate<O>,
        error?: ValidationErrorInput<O>,
        id?: symbol
    ): this 

    transforms(
        transform: ValidatorTransform<O>,
        id?: symbol
    ): this 
    transforms(
        transform: ValidatorTransform<O>,
        error?: ValidationErrorInput<O>,
        id?: symbol
    ): this 

}

type Validators<I,O> = [mainValidator: Validate<I,O>, ...genericValidators: Validate<O,O>[]]

//// Implementation ////

class ValidatorPipe<I, O = I> extends Validate<I,O> implements ValidatorPipeProperties<I,O> {

    readonly validate: Validate<I,O>

    constructor(settings: ValidatorSettings<I,O>) {
        super(validateAll)
        const validator = Validator.from(settings) 
        this.validate = defineMainValidatorId(validator) as Validate<I,O>
    }

    //// Validation Interface ////
    
    validates(
        input: Partial<ValidatorSettings<O,O>> | Validate<O>,
        id?: symbol
    ): this {

        const validator = Validator.from(input) as Validator<O>

        if (!id) 
            id = resolveId(validator) as symbol

        if (id)
            defineSymbol(validator, $$id, id)

        return spliceValidator(this, validator, withId(id)) as this
    }

    asserts(
        isValid: ValidatorPredicate<O>,
        ...args: [error?: ValidationErrorInput<O>, id?: symbol] | [id?: symbol]
    ): this {
        
        return this.validates({
            isValid: isValid as O extends O ? ValidatorPredicate<O> | ValidatorTypeGuard<O, O> : ValidatorPredicate<O>,
            ...sortIdErrorArgs(args)
        })
    }

    transforms(
        transform: ValidatorTransform<O>,
        ...args: [error?: ValidationErrorInput<O>, id?: symbol] | [id?: symbol]
    ): this {
        return this.validates({
            transform,
            ...sortIdErrorArgs(args)
        })
    }

    removeValidator(
        id: symbol
    ): this {
        if (id === $$mainId)
            throw new Error('Cannot removed the main validator')

        return spliceValidator(this, nil, withId(id)) as this
    }

    //// Iteration ////

    *[Symbol.iterator](): IterableIterator<Validators<I,O>[number]> {
        yield* (this.validate instanceof Pipe 
            ? this.validate.transforms
            : [this.validate]) as Iterable<Validators<I,O>[number]>
    }

}

//// Exports ////

export default ValidatorPipe 

export { 
    ValidatorPipeProperties,
    ValidatorPipe,
    Validators
} 