import {
    isNumber,
    isString,
    isNaN,
} from '@benzed/util'

import { AbstractNumber } from './numeric'

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

class Number extends AbstractNumber {

    constructor() {
        super({
            name: 'number',
            cast: toNumber,
            isValid: isNumber
        })
    }

}

//// Exports ////

export default Number

export {
    Number
}

export const $number = new Number