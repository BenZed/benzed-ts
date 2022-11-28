import { extendable, extend } from '@benzed/immutable'
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

    is(input: unknown): input is T

    assert(input: unknown): asserts input is T

    validate(input: unknown, ctx?: ValidateOptions): T

    validates(
        validate: Validate<T,T>,
        id?: string | number | symbol
    ): this

    validates(
        settings: ValidatorSettings<T, T>,
        id?: string | number | symbol
    ): this

    readonly validators: Validator<T,T>[]

    getValidator<V extends Validator<T,T>>(id: string | number | symbol): V | nil

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

    extend<E extends object>(
        extension: E
    ): this & E 

}

//// Hero Methods ////

function is(this: Schema, input: unknown): input is unknown {
    try {
        void this.validate(input, { transform: false })
        return true
    } catch {
        return false
    }
}

function assert(this: Schema, input: unknown ): asserts input is unknown {
    void this.validate(input, { transform: false })
}

function validateAll(this: Schema, input: unknown, ctx?: ValidateOptions): unknown {

    for (const validator of this.validators) 
        input = validator(input, ctx)
    
    return input
}

//// Extendable  ////

const schematic = extend(validateAll, {

    get is() {
        const schema = this as Schema<unknown>
        return is.bind(schema)
    },

    get assert() {
        const schema = this as Schema<unknown>
        return assert.bind(schema)
    },

    get validate() {
        const schema = this as Schema<unknown>
        return validateAll.bind(schema)
    },

    validates(
        this: Schema, 
        settings: ValidatorSettings<unknown, unknown>,
        id?: number | string | symbol
    ): Schema {

        const index = id === nil 
            ? -1 
            : this.validators.findIndex(v => $$id in v && (v as Validator<unknown, unknown> & { [$$id]: string | number | symbol })[$$id] === id)

        const previous = this.validators[index]

        const validate = extendable(validator(previous)).extend(settings).extend({ [$$id]: id })

        const validators = [ ...this.validators ]
        if (index in validators)
            validators.splice(index, 1, validate)
        else 
            validators.push(validate)

        return this.extend({ validators })
    },

    getValidator<V extends Validator<unknown,unknown>>(id: string | number | symbol): V | nil {
        return this
            .validators
            .find(v => 
                $$id in v && 
                (v as V & { [$$id]: string | number | symbol })[$$id] === id
            ) as V | nil
    },

    validators: [] as Validator<unknown,unknown>[],

    transforms(
        this: Schema, 
        transform: (i: unknown, ctx: ValidateContext<unknown>) => unknown,
        error?: string | ErrorMessage,
        id?: number | string | symbol
    ): Schema {
        return this.validates({ transform, error }, id)
    },
    
    asserts(
        this: Schema, 
        assert: (i: unknown, ctx: ValidateContext<unknown>) => boolean, 
        error?: string | ErrorMessage,
        id?: number | string | symbol
    ): Schema {
        return this.validates({ assert, error }, id)
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
