import { merge } from '@benzed/util'

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

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

interface Schema<T = unknown> extends Validate<unknown, T> {

    readonly validators: readonly Validator<T>[]
    readonly validate: Validate<unknown, T>

    is(input: unknown): input is T
    assert(input: unknown): asserts input is T

    asserts(
        assert: IsValid<T>,
        msg?: string | ErrorMessage<T>
    ): this

    transforms(
        transform: Transform<T>, 
        msg?: string | ErrorMessage<T>, 
        equals?: (a: unknown, b: unknown) => boolean
    ): this

}

type Infer<S extends Schema<any>> = S extends Schema<infer T> ? T : unknown

type Assert<T> = T extends Schema<infer Tx> ? Assert<Tx> : (input: unknown) => asserts input is T

//// Interface ////

function is(
    this: { validate: Validate }, 
    input: Readonly<unknown>
): input is Readonly<unknown> {

    try {
        void this.validate(input, { transform: false })
        return true
    } catch {
        return false
    }
}

function assert(
    this: { validate: Validate }, 
    input: Readonly<unknown>
): asserts input is Readonly<unknown> {
    void this.validate(input, { transform: false })
}

function asserts(
    this: Schema, 
    assert: IsValid, 
    msg?: string | ErrorMessage
): Schema {
    return schema(
        this, 
        { assert, msg }
    )
}

function transforms(
    this: Schema, 
    transform: Transform,
    msg?: string | ErrorMessage,
    equals?: (a: unknown, b: unknown) => boolean
): Schema {
    return schema(
        this, 
        { transform, msg, equals }
    )
}

//// Interface Helpers ////

function isSchema<T>(input: unknown): input is Schema<T> {

    if (typeof input !== 'function')
        return false 

    const schema = input as Partial<Schema<T>>

    return Array.isArray(schema.validators) && 
        typeof schema.assert === 'function' && 
        typeof schema.is === 'function'
}

type TypeSchemaSignature<T> = [
    is: (this: Schema<T>, i: unknown, ctx: ValidateContext) => i is T, 
    msg?: string | ErrorMessage<T>
]

function isTypedSchemaSignature(
    input: 
    AppendSchemaSignature<unknown> | 
    TypeSchemaSignature<unknown> | 
    Validator[]

): input is TypeSchemaSignature<unknown> {
    return typeof input[0] === 'function' && input.length <= 2
}

type AppendSchemaSignature<T> = [Schema<T>, Validator<T>]
function isAppendSchemaSignature(
    input: 
    AppendSchemaSignature<unknown> | 
    TypeSchemaSignature<unknown> | 
    Validator[]

): input is AppendSchemaSignature<unknown> {
    return isSchema(input[0])
}

//// Main ////

/**
 * Create a schema for an unknown value.
 */
function schema(): Schema<unknown>

/**
 * Create a schema from a list of validators
 */
function schema<T>(...validators: Validator<T>[]): Schema<T>
 
/**
 * Create a schema for a specific type
 * @param is Type guard to validate type against
 * @param msg Error string
 */
function schema<T>(
    is: TypeSchemaSignature<T>[0], 
    msg?: TypeSchemaSignature<T>[1]
): Schema<T>

/**
 * Immutably append a validator to an existing schema
 * @internal
 * @param schema
 * @param validator 
 */
function schema<T>(
    schema: AppendSchemaSignature<T>[0], 
    validator: AppendSchemaSignature<T>[1]
): Schema<T>

function schema(
    ...input: 
    AppendSchemaSignature<unknown> | 
    TypeSchemaSignature<unknown> | 
    Validator[]
): Schema<unknown> {

    const schema = isAppendSchemaSignature(input)
        ? { 
            ...input[0],
            validators: [
                ...input[0].validators,
                input[1]
            ]
        }
        : {

            is,
            assert,
            validate,
    
            asserts,
            transforms,

            validators: isTypedSchemaSignature(input)
                ? [{ 
                    assert: input[0], 
                    msg: input[1]
                }]
                : input,
        }

    // bind main methods
    schema.is = is.bind(schema) as typeof is
    schema.assert = assert.bind(schema)
    schema.validate = validate.bind(schema)

    return merge(
        validate.bind(schema),
        schema
    )
}

//// Extend ////

schema.is = isSchema

//// Exports ////

export default schema

export {
    schema,
    Schema,

    Infer,
    Assert,

    isSchema
}
