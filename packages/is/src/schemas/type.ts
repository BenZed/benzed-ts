import { nil, returns } from '@benzed/util'

import { schema, Schema, ValidateContext } from '../schema'
import { ErrorMessage, validator, Validator, ValidatorSettings } from '../validator'

//// Symbols ////

const $$type = Symbol('type-validator')

//// Types ////

/**
 * Method that potentially converts a value to the target type.
 */
 type Cast<T> = (i: unknown, ctx: ValidateContext) => T | unknown

 /**
  * Method that provides a default value, if the input was undefined or null
  */
 type Default<T> = (ctx: ValidateContext) => T

interface TypeValidatorSettings<T> extends Omit<ValidatorSettings<unknown, T>, 'transform'> {

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

interface TypeValidator<T> extends Validator<unknown, T>, TypeValidatorSettings<T> {}

interface TypeSchema<T> extends Schema<T> {

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

    /**
     * Change the name of the type when the error is thrown
     */
    name(name: string): this

    /**
     * Change the thrown error
     */
    error(error: string | ErrorMessage<T>): this
         
}

//// Schema ////

const typeValidator: TypeValidator<unknown> = validator({

    transform(input: unknown, ctx: ValidateContext): unknown {
    
        if (input === nil && this.default)
            input = this.default(ctx)
    
        if (!this.assert(input, ctx) && this.cast)
            input = this.cast(input, ctx)
    
        return input
    },
    
    assert(_input: unknown, _ctx: ValidateContext): _input is unknown {
        return true
    },
    
    error(): string {
        return `must be type ${this.name}`
    },

    name: 'unknown', 

    default: undefined as Default<unknown> | nil,

    cast: undefined as Cast<unknown> | nil,

    [$$type]: true

})

const typeSchematic: TypeSchema<unknown> = schema(typeValidator).extend({ 
    
    //// Instance Methods ////

    cast(this: TypeSchema<unknown>, cast: Cast<unknown> | nil): TypeSchema<unknown> {
        return typeSchema({ cast }, this)
    },

    default(this: TypeSchema<unknown>, _default: unknown | Default<unknown> | nil): TypeSchema<unknown> {
        return typeSchema({ 
            default: _default === nil || typeof _default === 'function'
                ? _default as nil | Default<unknown>
                : returns(_default)
        }, this)
    },

    name(this: TypeSchema<unknown>, name: string): TypeSchema<unknown> {
        return typeSchema({ name }, this)
    },

    error(this: TypeSchema<unknown>, error: string | ErrorMessage<unknown>): TypeSchema<unknown> {
        return typeSchema({ error }, this)
    }

})

//// Interface ////

/**
 * Create a type schema from given settings.
 */
function typeSchema<T>(settings?: TypeValidatorSettings<T>): TypeSchema<T>

/**
 * @internal 
 */
function typeSchema<T>(settings: Partial<TypeValidatorSettings<T>>, schemaToUpdate: TypeSchema<T>): TypeSchema<T> 

/**
 * @internal
 */
function typeSchema<T>(settings?: Partial<TypeValidatorSettings<T>>, schemaToUpdate = typeSchematic): TypeSchema<T> {

    const { validators } = schemaToUpdate

    return schemaToUpdate.extend({ 
        validators: validators.map(v => $$type in v 
            ? validator({ ...v, ...settings } as TypeValidatorSettings<T>)
            : v
        )
    }) as TypeSchema<T>
    
}

//// Exports ////

export default typeSchema 

export {
    typeSchema,
    TypeSchema
}