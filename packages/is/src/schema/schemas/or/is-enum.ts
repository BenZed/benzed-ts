import { Primitive } from '@benzed/util'

import { ValidationErrorMessage, Validator } from '../../../validator'

import ChainableSchema, { ChainableSchematic } from '../chainable-schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

const $$enum = Symbol('enum-validator')

//// Types ////

type IsEnumInput = Primitive[]

//// Setup ////

class IsEnum<T extends IsEnumInput> extends ChainableSchematic<T[number]> {

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

}

//// Exports ////

export default IsEnum

export {
    IsEnum,
    IsEnumInput
}