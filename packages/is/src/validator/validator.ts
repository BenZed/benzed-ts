import { $$copy, $$equals, Comparable, Copyable, equals } from '@benzed/immutable'
import { applyResolver, ContextTransform, Pipe, through as noTransformation } from '@benzed/util'

import { Validate, ValidateOptions } from './validate'
import { ValidationErrorMessage, ValidationError } from './error'

//// Types ////

interface ValidatorContext<T> extends Required<ValidateOptions> {
    readonly input: T
    transformed?: T
}

type ValidatorTypeGuard<I, O extends I = I> = 
    ((input: I, ctx: ValidatorContext<I>) => input is O) | 
    ContextTransform<I, boolean, ValidatorContext<I>>

type ValidatorTransform<I, O extends I = I> = ContextTransform<I, I | O, ValidatorContext<I>>

interface ValidatorSettings<I, O extends I = I> {

    is?: ValidatorTypeGuard<I, O>

    transform?: ValidatorTransform<I, O>

    error?: string | ValidationErrorMessage<I>

}

//// Helper ////

const isEqualTransformed: ValidatorTypeGuard<unknown> = (i, ctx) => equals(i, ctx.transformed)

const applyTransform = <I>(transform: ValidatorTransform<I> = noTransformation) => 
    (ctx: ValidatorContext<I>) => applyResolver(
        transform(ctx.input, ctx), 
        transformed => ({ 
            ...ctx, 
            transformed, 
            output: ctx.transform 
                ? transformed as I
                : ctx.input 
        })
    )

const applyValidate = <I, O extends I>(
    is: ValidatorTypeGuard<I,O> = isEqualTransformed, 
    error: string | ValidationErrorMessage<I> = 'Validation failed.' 
) => 
    (ctx: ValidatorContext<I> & { output: I | O }) => applyResolver(
        is(ctx.output as O, ctx), 
        isValid => isValid ? ctx.output : ValidationError.throw(ctx, error)
    )

const createCtx = <I>(input: I, options?: ValidateOptions): ValidatorContext<I> => 
    ({ transform: true, path: [], input, ...options })

//// Main ////

class Validator<I, O extends I = I> extends Validate<I, O> implements ValidatorSettings<I, O>, Copyable, Comparable {

    error?: string | ValidationErrorMessage<I>

    transform?: ValidatorTransform<I, O>

    is?: ValidatorTypeGuard<I, O>

    constructor({ is, transform, error }: ValidatorSettings<I,O>) {

        // The types arn't set up to handle async validation yet, but when the time comes.
        const maybeAsyncValidate = Pipe
            .from(applyTransform(transform))
            .to(applyValidate(is, error))

        super((input, options = {}) => maybeAsyncValidate(createCtx(input, options)) as O)

        this.is = is
        this.transform = transform
        this.error = error
    }

    applySettings<S extends ValidatorSettings<I,O>>(settings: S): this {
        const Constructor = this.constructor as new (settings: ValidatorSettings<I,O>) => this
        const copy = new Constructor({ ...settings })
        return copy
    }

    [$$copy](): this {
        return this.applySettings({ ...this })
    }

    [$$equals](other: unknown): other is this {
        return other instanceof Validator &&
             other.constructor === this.constructor && 
             equals({ ...this }, { ...other })
    }
}

//// Exports ////

export default Validator 

export {
    Validator,
    ValidatorSettings,
    ValidatorTransform,
    ValidatorTypeGuard,

    ValidatorContext,
    createCtx as createValidatorContext

}