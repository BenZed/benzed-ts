import { extendable, push } from '@benzed/immutable'

import { 
    ErrorMessage, 
    
    Validate, 
    ValidateContext, 
    ValidatorSettings, 
    
    Validator, 
    validator, 
    ValidateOptions 
} from '../validator'

//// Type ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

type Infer<S extends Schema<any>> = S extends Schema<infer T> ? T : unknown

type Assert<T> = T extends Schema<infer Tx> 
    ? Assert<Tx> 
    : (input: unknown) => asserts input is T

interface Schema<T = unknown> extends Validate<unknown, T> {

    readonly validate: Validate<unknown, T>

    is(input: unknown): input is T

    assert(input: unknown): asserts input is T

    asserts(
        assert: (i: T, ctx: ValidateContext<T>) => boolean,
        msg?: string | ErrorMessage<T>
    ): this

    transforms(
        transform: (i: T, ctx: ValidateContext<T>) => T,
        msg?: string | ErrorMessage<T>
    ): this

    validates(
        settings: ValidatorSettings<T, T>
    ): this

    readonly validators: Validator<T,T>[]

    extend<E extends object>(
        extension: E
    ): this & E 

    /**
     * Update a validator with a given type guard
     * @param settings 
     */
    update<V extends ValidatorSettings<any,any>>(
        settings: V, 
        typeGuard: (validator: unknown, index: number) => validator is V
    ): this
         
    /**
     * Update a validator with the given settings.
     * @param settings 
     */
    update(
        settings: ValidatorSettings<T,T>, 
        predicate: (validator: Validator<T,T>, index: number) => boolean
    ): this

}

//// Main ////

function validate(this: Schema, input: unknown, ctx?: ValidateOptions): unknown {

    for (const validator of this.validators) 
        input = validator(input, ctx)
    
    return input
}

const schematic = extendable(validate).extend({

    is(
        this: { validate: Validate<unknown,unknown> }, 
        input: unknown
    ): input is unknown {
        try {
            void this.validate(input, { transform: false })
            return true
        } catch {
            return false
        }
    },

    assert(
        this: { validate: Validate<unknown, unknown> }, 
        input: unknown
    ): asserts input is unknown {
        void this.validate(input, { transform: false })
    },

    validators: [] as Validator<unknown,unknown>[],

    validate,

    validates(
        this: Schema, 
        settings: ValidatorSettings<unknown, unknown>
    ): Schema {
        return this.extend({
            validators: push(this.validators, validator(settings))
        })
    },

    asserts(
        this: Schema, 
        assert: (i: unknown, ctx: ValidateContext<unknown>) => boolean, 
        error?: string | ErrorMessage
    ): Schema {
        return this.validates({ assert, error })
    },

    transforms(
        this: Schema, 
        transform: (i: unknown, ctx: ValidateContext<unknown>) => unknown,
        error?: string | ErrorMessage
    ): Schema {
        return this.validates({ transform, error })
    },

})

//// Interface ////

function schema<T>(
    typeValidator: ValidatorSettings<unknown, T>
): Schema<T> {
    return (schematic as Schema<unknown>).validates(typeValidator) as Schema<T>
}

//// Exports ////

export default schema

export {
    schema,
    Schema,

    Infer,
    Assert
}
