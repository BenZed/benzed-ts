
import {
    ContextTransform,
    defined, 
    isFunc, 
    Pipe,
    through as noTransform
} from '@benzed/util'

import { Validate, ValidateOptions } from './validate'
import { ValidationErrorMessage, ValidationError } from './error'
import { equals } from '@benzed/immutable'

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

    is?: ValidatorTypeGuard<I, O> | ValidatorPredicate<I>

    transform?: ValidatorTransform<I, O>

    error?: string | ValidationErrorMessage<I>

    id?: string | symbol

}

//// Helpers ////

const isTransformEqual = <I>(input: I, ctx: ValidatorContext<I>): boolean => 
    equals(input, ctx.transformed)

//// Main ////

class Validator<I, O extends I = I> extends Validate<I, O> implements Required<ValidatorSettings<I,O>> {

    static from<Ix,Ox>(...input: (Validate<Ix,Ox> | ValidatorSettings<Ix,Ox>)[]): Validate<Ix,Ox> {

        const validators = input.map(v => isFunc(v) ? v : new Validator(v))
        const validator = validators.length === 1 
            ? validators[0] 
            : Pipe.from(...validators)
    
        return validator
    }

    is: ValidatorTypeGuard<I,O> = this.is ?? isTransformEqual

    transform: ValidatorTransform<I,O> = this.transform ?? noTransform

    error: string | ValidationErrorMessage<I> = this.error ?? 'Validation failed.'

    constructor(settings: ValidatorSettings<I,O>) {
        super((i, ctx) => this.validate(i, ctx))
        assign(this, defined(settings))

        this.validate = this.validate.bind(this)
    }

    validate(input: I, options: ValidateOptions): O {

        const ctx: ValidatorContext<I> = { transform: true, path: [], input, ...options }

        ctx.transformed = this.transform(ctx.input, ctx)

        const output = ctx.transform ? ctx.transformed : ctx.input 

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

    ValidatorContext,
    createCtx as createValidatorContext

}