import { nil, Pipe, merge, OutputOf } from '@benzed/util'
import { copy } from '@benzed/immutable'

import {

    Validate,
    ValidatorSettings, 

    Validator, 
    ValidateOptions,
    AnyValidate

} from '../validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Types ////

class Schema<T = unknown> extends Validate<unknown, T> {

    static validate<T>(this: Schema<T>, i: unknown, options?: ValidateOptions): T {
        if (this as { validate: Validate<unknown,T> } === Schema)
            return i as T

        return this.validate(i, options)
    }

    static replace<Tx>(schema: Schema<unknown>, validate: Validate<Tx>): Schema<Tx> {
        return merge(copy(schema), { validate }) as Schema<Tx>
    }
    
    static merge<Vx extends Schema<unknown>>(schema: Vx, ...validators: Validate<OutputOf<Vx>>[]): Vx 
    static merge<Tx>(schema: Schema<Tx>, ...validators: Validate<Tx>[]): Schema<Tx> {
        const validate = Validator.from(schema.validate, ...validators as Validate<unknown, Tx>[])
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

    constructor(validate: Validate<unknown, T>)
    constructor(settings: Partial<ValidatorSettings<unknown, T>>)
    constructor(input: Validate<unknown, T> | Partial<ValidatorSettings<unknown, T>>) {
        super(Schema.validate)
        this.validate = Validator.from(input)
    }

    //// Struct Methods ////

    override get state(): Partial<this> {
        const { validate } = this
        return { validate } as Partial<this>
    }

    //// Schematic Methods ////

    readonly validate: Validate<unknown, T>

}

//// Exports ////

export default Schema

export {
    Schema,
}
