import {
    isInteger as _isInteger, isString, 
} from '@benzed/util'

import IsNumeric from './is-numeric'

//// Helper ////

const toInteger = (i: unknown): unknown => isString(i) ? parseInt(i) : i 

//// Boolean ////

class IsInteger extends IsNumeric<number> {
    constructor() {
        super({
            type: 'integer',
            is: _isInteger,
            cast: toInteger
        })
    }
}

//// Exports ////

export default IsInteger

export {
    IsInteger
}

export const isInteger = new IsInteger
