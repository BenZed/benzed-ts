import { nil, asNil, extendable } from '@benzed/util'
import { $$copy, push } from '@benzed/immutable'

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

    validates(
        validator: Validator<T>
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
    return this.validates({ assert, msg })
}

function transforms(
    this: Schema, 
    transform: Transform,
    msg?: string | ErrorMessage
): Schema {
    return this.validates({ transform, msg })
}

function validates(
    this: Schema, 
    validator: Validator
): Schema {
    return this.extend({
        validators: push(this.validators, validator)
    })
}

//// Immutable ////

function copy(
    this: Schema,
): Schema {
    return this.extend({})
}

//// Interface Helpers ////

function isSchema<T>(input: unknown): input is Schema<T> {

    if (asNil(input) === nil)
        return false

    if (typeof input !== 'function' && typeof input !== 'object')
        return false 

    const schema = input as Partial<Schema<T>>

    return Array.isArray(schema.validators) && 
        typeof schema.extend === 'function' && 
        typeof schema.is === 'function' && 
        typeof schema.asserts === 'function' && 
        typeof schema.validate === 'function' &&
        typeof schema.transforms === 'function' &&
        typeof schema.validates === 'function'
}

//// Main ////

function schema<T>(
    ...validators: Validator<T>[]
): Schema<T> {

    return extendable(
        validate,
        {
            is,
            assert,

            validate,
            validates,
            validators,

            asserts,
            transforms,
            
            [$$copy]: copy,
        },
        true
    ) as Schema<T> 
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
    isSchema,

    Infer,
    Assert
}
