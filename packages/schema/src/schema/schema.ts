
import { isFunc } from '@benzed/util'

import {
    AnyValidate,
    Validate,
    ValidationErrorInput,
    Validator,
    ValidatorPredicate,
    ValidatorSettings,
    ValidatorTransform,
} from '../validator'

import { ToValidator } from '../validator/validator-from'
  
import { SchemaCursor, SchemaSetters, SchemaSettings, ToSchemaSettings } from './schema-cursor'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Types ////

interface SchemaProperties<I,O> extends Validate<I,O> {

    validates<T extends Partial<ValidatorSettings<O, O>>>(settings: T): this
    validates(validate: ValidatorPredicate<I>): this

    asserts(
        isValid: ValidatorPredicate<O>,
        error?: ValidationErrorInput<I>,
        id?: symbol
    ): this

    transforms(
        transform: ValidatorTransform<O>,
        error?: ValidationErrorInput<I>, 
        id?: symbol
    ): this
}

type Schema<I,O,T extends SchemaSettings> = SchemaCursor<I, O, T> & SchemaProperties<I,O> & SchemaSetters<I, O, T>

type AnySchema = Schema<unknown, unknown, SchemaSettings>

interface SchemaConstructor {

    new <V extends AnyValidate | SchemaSettings>(validate: V): ToSchema<V>

}

type ToSchema<V extends AnyValidate | SchemaSettings> = V extends Validate<infer I, infer O> 
    ? Schema<I, O, ToSchemaSettings<I, V>>
    : V extends SchemaSettings
        ? ToValidator<V> extends Validate<infer I, infer O>
            ? Schema<I, O, ToSchemaSettings<I, V>>
            : never
        : never 

//// Main ////

const Schema = class <I, O, T extends SchemaSettings> extends SchemaCursor<I, O, T> {

    //// Instance ////

    constructor(settings: T) {
        super(settings as any)
    }

    validates(
        input: Partial<ValidatorSettings<unknown>> | Validate<unknown>
    ): this {
        let validate = (isFunc(input) ? input : Validator.from(input)) as AnyValidate

        validate = Validator.merge(...this.validators as [AnyValidate], validate)

        const schema = this.copy()
        schema.state = { validate } as unknown as Partial<this>
        return schema
    }

    asserts(
        isValid: ValidatorPredicate<unknown>,
        error?: ValidationErrorInput<unknown>
    ): this {
        return this.validates({
            isValid,
            error
        })
    }

    transforms(
        transform: ValidatorTransform<unknown>,
        error?: ValidationErrorInput<unknown>
    ): this {
        return this.validates({
            transform,
            error
        })
    }

    //// Iteration ////

    get validators(): AnyValidate[] {
        return Array.from(this)
    }

    *[Symbol.iterator](): IterableIterator<AnyValidate> {
        yield* (this as unknown as Schema<I,O,T>).validate.transforms
    }

} as unknown as SchemaConstructor

//// Exports ////

export default Schema 

export {
    Schema,
    AnySchema
}