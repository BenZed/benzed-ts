import {
    isInteger as _isInteger, isString, 
} from '@benzed/util'

import Numeric from './numeric'

//// Helper ////

const toInteger = (i: unknown): unknown => isString(i) ? parseInt(i) : i 

//// Boolean ////

class Integer extends Numeric<number> {
    constructor() {
        super({
            name: 'integer',
            is: _isInteger,
            cast: toInteger
        })
    }
}

//// Exports ////

export default Integer

export {
    Integer
}

export const isInteger = new Integer
