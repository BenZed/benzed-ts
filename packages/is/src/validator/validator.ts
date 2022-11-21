import { merge } from '@benzed/util'

import { 
    context,
    ValidateContext, 
    ValidateOptions 
} from './context'

import { ErrorMessage, toErrorMessage, ValidationError } from './error'

//// Types ////

type IsValid<T = unknown> = (i: Readonly<T>, ctx: ValidateContext) => boolean

type Transform<T = unknown> = (i: Readonly<T>, ctx: ValidateContext) => T

type Validator<T = unknown> = { msg: ErrorMessage<T> } & ({ transform: Transform<T> } | { assert: IsValid<T> })

interface Validate<I = unknown, O extends I = I> {
    (input: I, ctx?: Partial<ValidateOptions>): O
}

interface Schema<I = unknown, O extends I = I> extends Validate<I, O> {

    readonly validators: readonly Validator<I>[]

    is(i: I): i is O
    assert(i: I): asserts i is O
    validate: Validate<I, O>

    asserts<Ox extends I>(is: (i: I) => i is Ox, msg?: string | ErrorMessage<I>): Schema<I, Ox>
    asserts(assert: IsValid<I>, msg?: string | ErrorMessage<I>): Schema<I, O>

    transforms(transform: Transform<O>, msg?: string | ErrorMessage<O>): Schema<I, O>

}

//// Validator ////

function is(this: Schema, input: unknown): input is unknown {
    try {
        void this(input)
        return true
    } catch {
        return false
    }
}

function assert(this: Schema, input: unknown): asserts input is unknown {
    void this(input, { transform: false })
}

function asserts(this: { validators: readonly Validator[] }, assert: IsValid, msg?: string | ErrorMessage): Schema {
    return _schema(
        ...this.validators,
        { assert, msg: toErrorMessage(msg) }
    )
}

function transforms(this: { validators: readonly Validator[] }, transform: Transform, msg?: string | ErrorMessage): Schema {
    return _schema(
        ...this.validators,
        { transform, msg: toErrorMessage(msg) }
    )
}

function validate(this: { validators: readonly Validator[] }, input: Readonly<unknown>, options?: Partial<ValidateOptions>): unknown {

    const ctx = context({ input, ...options })
    
    for (const validator of this.validators) {
        
        const isTransform = 'transform' in validator 
        const output = isTransform ? validator.transform(input, ctx) : validator.assert(input, ctx)

        if (
            // assertion failed
            !isTransform && !output ||
            
            // transform failed
            isTransform && (!ctx.transform || !ctx.transform(output, input)) 
        )
            throw new ValidationError(validator.msg(input), ctx)

        // apply transform
        else if (isTransform && ctx.transform)
            input = output as Readonly<unknown>
    }

    return input
}

function _schema(...validators: Validator[]): Schema {

    const instance = { 

        validators,

        is,
        assert,
        validate,

        asserts,
        transforms

    }

    return merge(
        validate.bind(instance),
        instance
    ) as Schema

}

//// Exports ////

export default function schema(): Schema<unknown, unknown> {
    return _schema()
}

export {
    schema,

    Schema,
    Validate,
}
