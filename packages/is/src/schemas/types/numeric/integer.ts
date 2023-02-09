import {
    isInteger, isString, TypeGuard, 
} from '@benzed/util'

import { AbstractNumber } from './numeric'

//// Helper ////

const toInteger = (i: unknown): unknown => isString(i) ? parseInt(i) : i 

//// Boolean ////

class Integer extends AbstractNumber {

    constructor() {
        super({
            name: 'integer',
            isValid: isInteger as TypeGuard<number>,
            cast: toInteger
        })
    }

}

//// Exports ////

export default Integer

export {
    Integer
}

export const $integer = new Integer
