import { asNil, isNil, merge, nil, pass } from '@benzed/util'

import { schema, Schema, ValidateContext, Validator } from '../schema'

//// Symbols ////

const $$type = Symbol('type-schema-state')

//// Types ////

interface TypeSchemaSettings<T> {

    /**
     * 
     */
    is(input: unknown, ctx: ValidateContext): input is T

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

interface TypeSchema<T> extends Schema<T> {

    /**
     * @internal
     */
    [$$type]: TypeSchemaSettings<T>

    /**
     * If the given input is not of the expected type,
     * this method will try to convert it.
     * 
     * Undefined will disable casting 
     */
    cast(cast: Cast<T> | nil): this

}

//// Helper ////

function cast<T>(this: TypeSchema<T>, cast: Cast<T> | nil): TypeSchema<T> {
    return type({
        ...this[$$type],
        cast
    })
}

//// Schema ////

function type<T>(settings: TypeSchemaSettings<T>, ...validators: Validator<T>[]): TypeSchema<T> {

    const transform = (input: unknown, ctx: ValidateContext): T => {

        // if (isNil(asNil(input)) && settings.default)
        //     input = settings.default(ctx)

        if (!settings.is(input, ctx) && settings.cast)
            input = settings.cast(input, ctx)

        return input as T
    }

    return merge(

        schema<T>(
            {
                transform,
                equals: pass // will be caught by the subsequent assert method
            },
            {
                assert: settings.is,
                msg: () => `must be a ${settings.name}`
            }, 
            ...validators
        ),

        { 
            [$$type]: settings,
            cast,
        }

    )

}

//// Exports ////

export default type 

export {
    type
}