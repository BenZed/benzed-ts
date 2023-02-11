import {
    isNumber,
    isString,
    isNaN,
} from '@benzed/util'

import { NumberValidator } from './numeric'

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

class Number extends NumberValidator {

}

//// Exports ////

export default Number

export {
    Number
}

export const $number = new Number