import {
    isNumber,
    isString,
    isNaN,
} from '@benzed/util'

import { 
    RangeValidator,
    SubValidation,
    ValidationErrorInput
} from '@benzed/schema'

import Numeric from './numeric'

//// Data ////

const $$finite = Symbol('infinite-validator')
const $$range = Symbol('range-validator')

//// Helper ////

const toNumber = (value: unknown): unknown => {

    if (isString(value)) {
        const parsed = parseFloat(value)
        if (!isNaN(parsed))
            return parsed
    }

    return value
}

//// Boolean ////

class Number extends Numeric<number> {

    constructor() {
        super({
            name: 'number',
            cast: toNumber,
            isValid: isNumber
        })
    }

    get finite(): this {
        return this.asserts(isFinite, 'Must be finite', $$finite)
    }

    get infinite(): this {
        return this.remove($$finite)
    }

    range = new SubValidation(RangeValidator, this, $$range)

    above(value: number, error?: ValidationErrorInput<number>): this {
        return this.range({ comparator: '>', value, error })
    }

    below(value: number, error?: ValidationErrorInput<number>): this {
        return this.range({ comparator: '<', value, error })
    }

    equalOrBelow(value: number, error?: ValidationErrorInput<number>): this {
        return this.range({ comparator: '<=', value, error })
    }

    equalOrAbove(value: number, error?: ValidationErrorInput<number>): this {
        return this.range({ comparator: '>=', value, error })
    }

    between(min: number, max: number, error?: ValidationErrorInput<number>): this {
        return this.range({ min, comparator: '..', max, error })
    }

}

//// Exports ////

export default Number

export {
    Number
}

export const $number = new Number