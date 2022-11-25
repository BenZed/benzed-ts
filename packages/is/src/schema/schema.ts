import { extendable } from '@benzed/immutable'
import { nil } from '@benzed/util'

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

//// Symbol ////

const $$id = Symbol('validator-identifier')

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
        msg?: string | ErrorMessage<T>,
        id?: string | number | symbol
    ): this

    transforms(
        transform: (i: T, ctx: ValidateContext<T>) => T,
        msg?: string | ErrorMessage<T>,
        id?: string | number | symbol
    ): this

    validates(
        settings: ValidatorSettings<T, T>,
        id?: string | number | symbol
    ): this

    readonly validators: Validator<T,T>[]

    extend<E extends object>(
        extension: E
    ): this & E 

}

//// Main ////

function validate(this: Schema, input: unknown, ctx?: ValidateOptions): unknown {

    for (const validator of this.validators) 
        input = validator(input, ctx)
    
    return input
}

const schematic = extendable(validate).extend({

    is(this: Schema, input: unknown): input is unknown {
        try {
            void this.validate(input, { transform: false })
            return true
        } catch {
            return false
        }
    },

    assert(this: Schema, input: unknown ): asserts input is unknown {
        void this.validate(input, { transform: false })
    },

    validators: [] as Validator<unknown,unknown>[],

    validate,

    validates(
        this: Schema, 
        settings: ValidatorSettings<unknown, unknown>,
        id?: number | string | symbol
    ): Schema {

        const index = id === nil 
            ? -1 
            : this.validators.findIndex(v => $$id in v && (v as any)[$$id] === id)

        const previous = this.validators[index]

        const validate = validator({ ...previous, ...settings, [$$id]: id })

        const validators = [ ...this.validators ]
        if (index in validators)
            validators.splice(index, 1, validate)
        else 
            validators.push(validate)

        return this.extend({
            validators
        })
    },

    asserts(
        this: Schema, 
        assert: (i: unknown, ctx: ValidateContext<unknown>) => boolean, 
        error?: string | ErrorMessage,
        id?: number | string | symbol
    ): Schema {
        return this.validates({ assert, error }, id)
    },

    transforms(
        this: Schema, 
        transform: (i: unknown, ctx: ValidateContext<unknown>) => unknown,
        error?: string | ErrorMessage,
        id?: number | string | symbol
    ): Schema {
        return this.validates({ transform, error }, id)
    },

}) as Schema

//// Interface ////

function schema<T>(
    typeValidator: ValidatorSettings<unknown, T>,
    id?: string | number | symbol
): Schema<T> {
    return schematic.validates(typeValidator, id) as Schema<T>
}

//// Exports ////

export default schema

export {
    schema,
    Schema,

    Infer,
    Assert,

    $$id
}
