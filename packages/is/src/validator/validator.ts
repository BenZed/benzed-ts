
import {
    ContextTransform,
    isFunc, 
    isString, 
    nil, 
    Pipe,
    Property,
} from '@benzed/util'
import { capitalize } from '@benzed/string'
import { equals, CallableStruct } from '@benzed/immutable'

import { Validate, ValidateOptions } from './validate'
import { ValidationErrorMessage, ValidationError } from './error'

//// Shorcuts ////

const { assign } = Object 

//// Types ////

interface ValidatorContext<T> extends Required<ValidateOptions> {
    readonly input: T
    transformed?: T
}

type ValidatorTypeGuard<I, O extends I = I> = 
    ((input: I, ctx: ValidatorContext<I>) => input is O)

type ValidatorPredicate<I> = ContextTransform<I, boolean, ValidatorContext<I>>

type ValidatorTransform<I, O extends I = I> = 
    ContextTransform<I, I | O, ValidatorContext<I>>

interface ValidatorSettings<I, O extends I = I> {

    is: ValidatorTypeGuard<I, O> | ValidatorPredicate<I>
    transform: ValidatorTransform<I, O>
    error: string | ValidationErrorMessage<I>
    id?: string | symbol

}

//// Helpers ////

const isTransformEqual = <I>(input: I, ctx: ValidatorContext<I>): boolean => 
    equals(input, ctx.transformed)

const noTransform = <I>(input: I): I => input

//// Main ////

class Validator<I, O extends I = I> extends CallableStruct<Validate<I,O>> {

    static from<Ix, Ox extends Ix>(...input: (Validate<Ix,Ox> | Partial<ValidatorSettings<Ix,Ox>>)[]): Validate<Ix,Ox> {

        const validators = input.map(v => isFunc(v) ? v : new Validator(v))
        const validator = validators.length === 1 
            ? validators[0] 
            : Pipe.from(...validators)

        const [first] = input

        // use name or id of the first input as the validator name
        const name = first && (
            'name' in first && first.name
                ? first.name
                : 'id' in first && isString(first.id) && first.id 
                    ? first.id 
                    : nil
        ) || 'validate'

        return Property.name(validator, name) as Validate<Ix,Ox>
    }

    is: ValidatorTypeGuard<I,O>
    transform: ValidatorTransform<I,O>
    error: string | ValidationErrorMessage<I> 

    constructor({
        is = isTransformEqual,
        transform = noTransform,
        error = 'Validation failed.',
        id,
        ...rest
    }: Partial<ValidatorSettings<I,O>> = {}) {

        super((i, options): O => this.validate(i, options))

        const name = isString(id) ? id : 'valid'

        this.is = Property.name(is, is.name || `is${capitalize(name)}`) as ValidatorTypeGuard<I,O>
        this.transform = Property.name(transform, transform.name || `to${capitalize(name)}`)
        this.error = error

        assign(this, { id, ...rest })

    }

    validate(input: I, options?: ValidateOptions): O {

        const ctx: ValidatorContext<I> = { 
            transform: true, 
            path: [], 
            input,
            ...options 
        }

        ctx.transformed = this.transform(ctx.input, ctx)

        const output = ctx.transform 
            ? ctx.transformed 
            : ctx.input 

        const isValid = this.is(output, ctx)
        if (!isValid)
            ValidationError.throw(ctx, this.error)

        return output
    }

}

//// Exports ////

export default Validator 

export {
    Validator,
    ValidatorSettings,
    ValidatorTransform,
    ValidatorTypeGuard,
    ValidatorPredicate,

    ValidatorContext
}