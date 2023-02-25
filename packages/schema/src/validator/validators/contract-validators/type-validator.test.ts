import { TypeValidator } from './type-validator'

import { describe } from '@jest/globals'
import { isBigInt, isNumber, isString } from '@benzed/util'

import { testValidator } from '../../../util.test'
 
//// Setup ////

class BigIntValidator extends TypeValidator<bigint> {

    isValid(value: unknown): value is bigint {
        return isBigInt(value)
    }

    cast(input: unknown): unknown {
        if (isString(input) && /\d+/.test(input) || isNumber(input)) 
            return BigInt(input)

        return input
    } 
}  

const $bigint = new BigIntValidator()

//// Tests ////

describe(`${$bigint.name} validator tests`, () => { 
    testValidator<unknown, bigint>(
        $bigint, 
        { asserts: 50n },
        { transforms: 0, output: 0n },
        { asserts: 'no-bueno', error: true }
    )
})