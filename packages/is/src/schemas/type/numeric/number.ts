import {
    isNumber,
    isString,
    isNaN,
} from '@benzed/util'

import Numeric from './numeric'

//// Data ////

const $$finite = Symbol('infinite-validator')

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

}

//// Exports ////

export default Number

export {
    Number
}

export const $number = new Number