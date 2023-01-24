
import {
    nil,
    isSymbol,
    isFunc,
} from '@benzed/util'

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

import { schemaReplace } from './schema-replace'
import { schemaUpsert } from './schema-upsert'
import { schemaMerge } from './schema-merge'

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

    replace: typeof schemaReplace
    merge: typeof schemaMerge
    upsert: typeof schemaUpsert

    new <V extends AnyValidate | CursorSettings>(validate: V): ToSchema<V>

}
//// Main ////

const Schema = class <I, O, T extends CursorSettings> extends Cursor<I,O> {

    //// Static ////

    static replace = schemaReplace

    static merge = schemaMerge
    static upsert = schemaUpsert

    //// Instance ////

    constructor(settings: T) {
        super(settings as any)
    }

    validates(
        input: Partial<ValidatorSettings<unknown>> | Validate<unknown>,
        id = 'id' in input && isSymbol(input.id) ? input.id : nil
    ): this {
        const validate = (isFunc(input) ? input : Validator.from(input)) as AnyValidate

        const anySchema = this as unknown as AnySchema

        return (
            isSymbol(id)
                ? Schema.upsert(anySchema, () => validate, id)
                : Schema.merge(anySchema, validate)
        ) as unknown as this
    }

    asserts(
        isValid: ValidatorPredicate<unknown>,
        error?: ValidationErrorInput<unknown>,
        id?: symbol
    ): this {
        return this.validates({
            isValid,
            error,
            id
        })
    }

    transforms(
        transform: ValidatorTransform<unknown>,
        error?: ValidationErrorInput<unknown>, 
        id?: symbol
    ): this {
        return this.validates({
            transform,
            error,
            id
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