import { merge } from '@benzed/util'
import { equals as deepEquals } from '@benzed/immutable'

import { 
    validate,
    Validate,
    Validator,

    Assert,
    Transform
} from './validate'

import { 

    ErrorMessage, 
    toErrorMessage

} from './error'

//// Types ////

interface Schema<T = unknown> extends Validate<T> {

    readonly validators: readonly Validator<T>[]
    readonly validate: Validate<T>

    is(i: unknown): i is T
    assert(i: unknown): asserts i is T

    asserts(
        assert: Assert<T>,
        msg?: string | ErrorMessage<T>
    ): this

    transforms(
        transform: Transform<T>, 
        msg?: string | ErrorMessage<T>, 
        equals?: (a: unknown, b: unknown) => boolean
    ): this

}

//// Interface ////

function is(
    this: Schema, 
    input: Readonly<unknown>
): input is Readonly<unknown> {

    try {
        void this(input)
        return true
    } catch {
        return false
    }
}

function assert(
    this: Schema, 
    input: Readonly<unknown>
): asserts input is Readonly<unknown> {
    void this(input, { transform: false })
}

function asserts(
    this: { validators: readonly Validator[] }, 
    assert: Assert, 
    msg: string | ErrorMessage = 'Assertion failed.'
): Schema {
    return schema(
        ...this.validators,
        { assert, msg: toErrorMessage(msg) }
    )
}

function transforms(
    this: { validators: readonly Validator[] }, 
    transform: Transform,
    msg: string | ErrorMessage = 'Transformation failed.',
    equals: (a: unknown, b: unknown) => boolean = deepEquals
): Schema {
    return schema(
        ...this.validators,
        { transform, msg: toErrorMessage(msg), equals }
    )
}

//// Interface Helpers ////

type TypeSchemaSignature<T> = [is: (i: unknown) => i is T, msg?: string | ErrorMessage<T>]
function isTypedSchemaSignature(
    input: unknown[]
): input is TypeSchemaSignature<unknown> {
    return typeof input[0] === 'function' && input.length <= 2
}

//// Main ////

/**
 * Create a schema for a specific type
 * @param is Type guard to validate type against
 * @param msg Error string
 */
function schema<T>(is: TypeSchemaSignature<T>[0], msg?: TypeSchemaSignature<T>[1]): Schema<T>

/**
 * Comebine a series of validators or schema's into one
 */
function schema<T>(...validators: (Validator<T>)[]): Schema<T> 

function schema(
    ...input: TypeSchemaSignature<unknown> | Validator[]
): Schema<unknown> {

    const instance = { 
        is,
        assert,
        validate,
        validators: isTypedSchemaSignature(input)
            ? [{ assert: input[0], msg: toErrorMessage(input[1] ?? 'Invalid type.') }]
            : input,

        asserts,
        transforms,
    }

    return merge(
        validate.bind(instance),
        instance
    )
}

//// Exports ////

export default schema

export {
    schema,
    Schema,
}
