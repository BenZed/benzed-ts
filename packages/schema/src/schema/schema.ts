
import { isFunc } from '@benzed/util'

import {
    AnyValidate,
    GenericValidatorSettings as SchemaSettings,
    Validate,
    ValidationErrorInput,
    Validator,
    ValidatorPredicate,
    ValidatorSettings,
    ValidatorTransform,
} from '../validator'
  
import { Cursor, CursorSettings, ToCursor } from './cursor'

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

type Schema<I,O,T extends CursorSettings> = SchemaProperties<I,O> & Cursor<I, O, T>

type AnySchema = Schema<unknown, unknown, SchemaSettings>

type ToSchema<V extends AnyValidate | CursorSettings> = ToCursor<V> extends Cursor<infer I, infer O, infer T>
    ? Schema<I,O,T>
    : never

interface SchemaConstructor {

    new <V extends AnyValidate | CursorSettings>(validate: V): ToSchema<V>

}
//// Main ////

const Schema = class <I, O, T extends CursorSettings> extends Cursor<I,O> {

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