import { nil, returns } from '@benzed/util'

import { schema, Schema, ValidateContext } from '../schema'

//// Symbols ////

const $$type = Symbol('type-settings')

//// Types ////

interface TypeSchemaSettings<T> {

    /**
     * Is test
     */
    isType(input: unknown, ctx: ValidateContext): input is T

    /**
     * Name of the type
     */
    name: string

    /**
     * Default cast method for this type
     */
    cast?: Cast<T>

    /**
     * Method for setting this type's default value
     */
    default?: Default<T>

}

/**
 * Method that potentially converts a value to the target type.
 */
type Cast<T> = (i: unknown, ctx: ValidateContext) => T | unknown

/**
 * Method that provides a default value, if the input was undefined or null
 */
type Default<T> = (ctx: ValidateContext) => T

interface TypeSchemaProperties<T> {

    [$$type]: TypeSchemaSettings<T>

    /**
     * If the given input is not of the expected type,
     * this method will try to convert it.
     * 
     * Undefined will disable casting 
     */
    cast(cast: Cast<T> | nil): this

    /**
     * Provide a default value for this schema, in
     * the event it is
     *
     * @param value 
     */
    default(value: Default<T> | T | nil): this

}

interface TypeSchema<T> extends Schema<T>, TypeSchemaProperties<T> {}

//// Helper ////

function cast<T>(this: TypeSchema<T>, cast: Cast<T> | nil): TypeSchema<T> {
    return this.extend({ 
        [$$type]: {
            ...this[$$type], 
            cast 
        }
    })
}

function _default<T>(this: TypeSchema<T>, _default: T | Default<T> | nil): TypeSchema<T> {

    const _defaultType = typeof _default

    return this.extend({ 
        [$$type]: {
            ...this[$$type], 
            default: _defaultType === 'function' || _defaultType === 'undefined'
                ? _default
                : returns(_default)
        }
    })

}

function typeTransform<T>(this: TypeSchema<T>, input: unknown, ctx: ValidateContext): T {

    const settings = this[$$type]

    if (input === nil && settings.default)
        input = settings.default(ctx)

    if (!settings.isType(input, ctx) && settings.cast)
        input = settings.cast(input, ctx)

    return input as T
}

function typeAssert<T>(this: TypeSchema<T>, input: unknown, ctx: ValidateContext): input is T {
    const settings = this[$$type]
    return settings.isType(input, ctx) 
}

//// Schema ////

function type<T>(settings: TypeSchemaSettings<T>): TypeSchema<T> {
    
    return schema<T>({
        transform: typeTransform,
        assert: typeAssert,
        msg: `must be a ${settings.name}`
    }).extend<TypeSchemaProperties<T>>({
        [$$type]: settings,
        cast,
        default: _default
    })

}

//// Exports ////

export default type 

export {
    type
}