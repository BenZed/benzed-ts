import { isFunc, isNil, nil, returns } from '@benzed/util'

import { 
    schema, 
    Schema,
    ValidateContext 
} from '../schema'

import { 
    ErrorMessage, 
    
    Validator, 
    ValidatorSettings 
} from '../../validator'

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
    type: string

    /**
     * Default cast method for this type
     */
    cast?: Cast<T>

    /**
     * Method for setting this type's default value
     */
    default?: Default<T>

}

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
    typeName(name: string): this

    /**
     * Change the thrown error
     */
    error(error: string | ErrorMessage<T>): this
         
}

//// Schema ////

// const typeValidator: TypeValidator<unknown> = new Validator({

//     transform(input: unknown, ctx: ValidateContext): unknown {
    
//         if (input === nil && this.default)
//             input = this.default(ctx)
    
//         if (!this.assert(input, ctx) && this.cast)
//             input = this.cast(input, ctx)
    
//         return input
//     },
    
//     assert(_input: unknown, _ctx: ValidateContext): _input is unknown {
//         return true
//     },
    
//     error(): string {
//         return `must be type ${this.type}`
//     },

//     type: 'unknown', 

//     default: undefined as Default<unknown> | nil,

//     cast: undefined as Cast<unknown> | nil

// })

class TypeValidator<T> extends Validator<unknown, T> implements TypeValidatorSettings<T> {

}

// const typeSchematic: TypeSchema<unknown> = schema(typeValidator, $$type).extend({ 
    
//     //// Instance Methods ////

//     cast(this: TypeSchema<unknown>, cast: Cast<unknown> | nil): TypeSchema<unknown> {
//         return typeSchema({ cast }, this)
//     },

//     default(this: TypeSchema<unknown>, _default: unknown | Default<unknown> | nil): TypeSchema<unknown> {
//         return typeSchema({ 
//             default: isNil(_default) || isFunc(_default)
//                 ? _default as nil | Default<unknown>
//                 : returns(_default)
//         }, this)
//     },

//     typeName(this: TypeSchema<unknown>, type: string): TypeSchema<unknown> {
//         return typeSchema({ type }, this)
//     },

//     error(this: TypeSchema<unknown>, error: string | ErrorMessage<unknown>): TypeSchema<unknown> {
//         return typeSchema({ error }, this)
//     }

// })

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

    return schemaToUpdate.validates(settings as TypeValidatorSettings<T>, $$type) as TypeSchema<T>
    
}

//// Exports ////

export default typeSchema 

export {
    typeSchema,
    TypeSchema
}