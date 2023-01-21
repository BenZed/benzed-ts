import { nil, Pipe, merge, OutputOf, ParamPipe } from '@benzed/util'
import { copy } from '@benzed/immutable'

import {
    Validate,
    Validator, 
    ValidateOptions,
    AnyValidate
} from '../validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Types ////

function schemaValidate <T>(this: Schema<T>, i: unknown, options?: ValidateOptions): T {
    return this.validate(i, options)
}

type SchemaValidate<T> = Validate<unknown,T>

//// Helper ////

class Schema<T = unknown> extends Validate<unknown, T> {

    static replace<Tx>(schema: Schema<unknown>, validate: SchemaValidate<Tx>): Schema<Tx> {
        const clone = schema.copy()
        console.log(schema.constructor.name, 'replace', { validate })
        clone.state = { ...schema.state, validate }
        return clone as Schema<Tx>
    }

    static merge<Vx extends Schema<unknown>>(schema: Vx, ...validators: Validate<OutputOf<Vx>>[]): Vx 
    static merge<Tx>(schema: Schema<Tx>, ...validators: Validate<Tx>[]): Schema<Tx> {
        const validate = Validator.from(schema.validate, ...validators as SchemaValidate<Tx>[])
        return this.replace(schema, validate)
    }

    static upsert<Vx extends Schema<unknown>>(
        schema: Vx, 
        update: (previous?: AnyValidate) => AnyValidate,
        id?: string | symbol): Vx
    static upsert<Tx>(
        schema: Schema<Tx>, 
        update: (previous?: AnyValidate) => AnyValidate,
        id?: string | symbol
    ): Schema<Tx> {

        const updatedValidators = Pipe.flatten([schema.validate]) as AnyValidate[]

        const index = id ? updatedValidators.findIndex(v => 'id' in v && v.id === id) : -1
        const isNew = index < 0

        const validator = update(isNew ? updatedValidators[index] : nil)
        if (isNew)
            updatedValidators.push(validator)
        else 
            updatedValidators.splice(index, 1, validator)

        return this.merge(schema, ...updatedValidators as Validate<Tx>[])
    }

    //// Constructor ////

    constructor(readonly validate: SchemaValidate<T>) {
        super(schemaValidate)
    }

    //// Struct Methods ////

    override get state(): Partial<this> {
        const { validate } = this
        return { validate } as unknown as Partial<this>
    }

    protected override set state(state: Partial<this>) {
        const { validate } = state
        if (!validate)
            throw new Error('validator required to set schema state')

        merge(this, { validate })
    }

}

//// Exports ////

export default Schema

export {
    Schema,
    SchemaValidate,
}
