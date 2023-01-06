import { Schema } from '../schema'
import { ValidationErrorMessage, Validator, ValidatorSettings } from '../validator'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type Enumerable = string | number | boolean | null | bigint

//// Setup ////

class EnumValidator<T extends readonly Enumerable[]> extends Validator<unknown, T[number]> {

    readonly options: T

    constructor(...options: T) {
        super({
            error: () => this.options.length >= 1 
                ? `must be one of ${this.options.slice(0, -1).join(', ')} or ${this.options.at(-1)}`
                : `must be ${this.options.at(0) ?? 'nil'}`,

            is: (input: unknown) => this.options.includes(input as T[number]),
        })

        this.options = options
    }
}

class EnumSchema<T extends readonly Enumerable[]> extends Schema<T[number]> {

    constructor(...options: T) {
        super(new EnumValidator(...options))
    }

    get options(): T {
        return (this._getValidator(EnumValidator<T>)?.options ?? []) as T
    }

    error(error: string | ValidationErrorMessage<unknown>): this {
        return this._setValidator(EnumValidator, v => v.applySettings({ error }))
    }

}

//// Exports ////

export default EnumSchema

export {
    EnumSchema
}