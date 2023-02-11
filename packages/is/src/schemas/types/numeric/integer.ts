import {
    isInteger, isString, TypeGuard, 
} from '@benzed/util'

import { NumberValidator } from './numeric'

//// Helper ////

const toInteger = (i: unknown): unknown => isString(i) ? parseInt(i) : i 

//// Boolean ////

class Integer extends NumberValidator {

    constructor() {
        super(isInteger)
    }

    override cast = toInteger

}

//// Exports ////

export default Integer

export {
    Integer
}

export const $integer = new Integer
