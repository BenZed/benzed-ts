import { Primitive } from '@benzed/util'
import { ValidationErrorMessage, Validator } from '../validator'
import ChainableSchema from './chainable-schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

const $$enum = Symbol('enum-validator')

//// Types ////

type EnumSchemaInput = Primitive[]

//// Setup ////

class EnumSchema<T extends EnumSchemaInput> extends ChainableSchema<T[number]> {

    readonly options: T

    constructor(...options: T) {
        super({
            error: () => this.options.length >= 1 
                ? `must be one of ${this.options.slice(0, -1).join(', ')} or ${this.options.at(-1)}`
                : `must be ${this.options.at(0) ?? 'nil'}`,

            is: (input: unknown) => this.options.includes(input as T[number]),
            id: $$enum
        })

        this.options = options
    }

    error(error: string | ValidationErrorMessage<unknown>): this {
        return this._setValidatorById($$enum, enumV => new Validator({ ...enumV, error }))
    }

}

//// Exports ////

export default EnumSchema

export {
    EnumSchema,
    EnumSchemaInput
}