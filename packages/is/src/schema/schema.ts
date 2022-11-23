import { nil, asNil, keysOf, merge } from '@benzed/util'
import { $$copy } from '@benzed/immutable'

import { 
    validate,
    Validate,
    Validator,
    IsValid,
    Transform
} from './validate'

import { 
    ErrorMessage 
} from './error'

import { 
    ValidateContext 
} from './context'

//// Type ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

interface Schema<T = unknown> extends Validate<unknown, T> {

    readonly validators: readonly Validator<T>[]
    readonly validate: Validate<unknown, T>

    is(input: unknown): input is T
    assert(input: unknown): asserts input is T

    extend<E extends object>(extension: E): this & E

    asserts(
        assert: IsValid<T>,
        msg?: string | ErrorMessage<T>
    ): this

    transforms(
        transform: Transform<T>, 
        msg?: string | ErrorMessage<T>
    ): this

}

type Infer<S extends Schema<any>> = S extends Schema<infer T> ? T : unknown

type Assert<T> = T extends Schema<infer Tx> 
    ? Assert<Tx> 
    : (input: unknown) => asserts input is T

//// Interface ////

function is(
    this: { validate: Validate }, 
    input: unknown
): input is unknown {

    try {
        void this.validate(input, { transform: false })
        return true
    } catch {
        return false
    }
}

function assert(
    this: { validate: Validate }, 
    input: unknown
): asserts input is unknown {
    void this.validate(input, { transform: false })
}

function asserts(
    this: Schema, 
    assert: IsValid, 
    msg?: string | ErrorMessage
): Schema {
    return schema(
        this, 
        [{ assert, msg }]
    )
}

function transforms(
    this: Schema, 
    transform: Transform,
    msg?: string | ErrorMessage
): Schema {
    return schema(
        this, 
        [{ transform, msg }]
    )
}

function copy(
    this: Schema,
): Schema {
    return this.extend({})
}

function extend<E extends object>(
    this: Schema,
    extension: E
): Schema & E {

    const extended = {
        ...this,
        ...extension,
    }

    // in case the extension overwrites any schema properties
    if (!isSchema(extended)) {
        throw new Error(
            `Schema cannot be extended with keys: ${[...keysOf(extension)]}`
        )
    }

    return schema(extended, []) as Schema & E
}

//// Interface Helpers ////

function isSchema<T>(input: unknown): input is Schema<T> {

    if (asNil(input) === nil)
        return false

    if (typeof input !== 'function' && typeof input !== 'object')
        return false 

    const schema = input as Partial<Schema<T>>

    return Array.isArray(schema.validators) && 
        typeof schema.assert === 'function' && 
        typeof schema.is === 'function' && 
        typeof schema.validate === 'function' && 
        typeof schema.asserts === 'function' && 
        typeof schema.transforms === 'function'
}

type TypeGuardSchemaSignature<T> = [
    is: (this: Schema<T>, i: unknown, ctx: ValidateContext) => i is T, 
    msg?: string | ErrorMessage<T>
]

function isTypeGuardSchemaSignature(
    input: 
    AppendSchemaSignature<unknown> | 
    TypeGuardSchemaSignature<unknown> | 
    Validator[]

): input is TypeGuardSchemaSignature<unknown> {
    return typeof input[0] === 'function' && input.length <= 2
}

type AppendSchemaSignature<T> = [Schema<T>, Validator<T>[]]
function isAppendSchemaSignature(

    input: 
    AppendSchemaSignature<unknown> | 
    TypeGuardSchemaSignature<unknown> |
    Validator[]

): input is AppendSchemaSignature<unknown> {
    return isSchema(input[0]) && Array.isArray(input[1])
}

//// Main ////

/**
 * Create a schema for an unknown value.
 */
function schema(): Schema<unknown>

/**
 * Create a schema for an unknown value.
 */
function schema<T>(...validators: Validator<T>[]): Schema<T>
 
/**
 * Create a schema for a specific type
 * @param is Type guard to validate type against
 * @param msg Error string
 */
function schema<T>(
    is: TypeGuardSchemaSignature<T>[0], 
    msg?: TypeGuardSchemaSignature<T>[1]
): Schema<T>

/**
 * Immutably append a validator to an existing schema
 * @internal
 * @param schema
 * @param validators
 */
function schema<T>(
    schema: AppendSchemaSignature<T>[0], 
    validators: AppendSchemaSignature<T>[1]
): Schema<T>

function schema(
    ...input: 
    AppendSchemaSignature<unknown> | 
    TypeGuardSchemaSignature<unknown> |
    Validator[]
): Schema<unknown> {

    const _schema = isAppendSchemaSignature(input)
        ? { 
            ...input[0],
            validators: [
                ...input[0].validators,
                ...input[1]
            ]
        }
        : {

            is,
            assert,
            validate,

            extend,

            asserts,
            transforms,

            [$$copy]: copy,

            validators: isTypeGuardSchemaSignature(input)
                ? [{ 
                    assert: input[0], 
                    msg: input[1]
                }]
                : input,
        }

    // bind main methods
    _schema.is = is.bind(_schema) as typeof is
    _schema.assert = assert.bind(_schema)
    _schema.validate = validate.bind(_schema)

    return merge(
        validate.bind(_schema),
        _schema
    )
}

//// Extend ////

/**
 * Is the given object a schema?
 * @param input 
 * @returns true if the input is a schema, false otherwise
 */
schema.is = isSchema

//// Exports ////

export default schema

export {
    schema,
    Schema,

    Infer,
    Assert
}
