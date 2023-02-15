import { isNumber, isString, nil, pick } from '@benzed/util'
import { describe } from '@jest/globals'

import { Schema } from '../schema'

import { ArrayValidator } from './array-validator'
import { TypeValidator } from '../type-validator'

import { $$settings } from '../../validate-struct'

import {
    testValidator,
    testValidationContract
} from '../../../util.test'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/ban-types,
*/

//// Setup ////

class NumberValidator extends TypeValidator<number> {

    name = 'number'

    isValid(value: unknown): value is number {
        return isNumber(value)
    }

    cast(input: unknown): unknown {
        return isString(input) ? parseFloat(input) : input
    }

    get [$$settings](): Pick<this, 'cast' | 'default'> {
        return pick(this, 'cast', 'default')
    }

}

class Number extends Schema<NumberValidator, {}> {
    constructor() {
        super(
            new NumberValidator,
            {}
        )
    }

    default(def: () => number): this {
        return this._applyMainValidator({ default: def })
    }
} 

const $numberSchema = new Number
 
const $arrayOfNumber = new ArrayValidator($numberSchema)

//// Tests ////

describe(`${$arrayOfNumber.name} validator tests`, () => {
    testValidator<unknown, number[]>(
        $arrayOfNumber,
        { asserts: [] },
        { asserts: [0] },
        { asserts: [0, 1, 2, 3] },
        { asserts: ['atr'], error: true },
        { transforms: ['0'], output: [0] },
        { transforms: ['atr'], error: true },
    )
})

describe(`${$arrayOfNumber.name} contract validator tests`, () => {
    testValidationContract(
        $arrayOfNumber,
        {
            validInput: [1,2,3,4],
            invalidInput: ['str', 'ace', 'base'],
            transforms: { invalidInput: ['0'], validOutput: [0] },
        }
    )
})

describe('retains wrapped validator properties', () => {

    testValidator<unknown, number[]>(
        $arrayOfNumber,
        { asserts: [nil, nil], error: true },
    )

    const $arrayOfDefaultZeros = $arrayOfNumber.default(() => 0)

    testValidator<unknown, number[]>(
        $arrayOfDefaultZeros,
        { asserts: [nil, nil], error: true },
        { transforms: [nil, nil], output: [0, 0] },
    )

})

describe('nestable', () => {

    const $arrayOfArrayOfNumber = new ArrayValidator(new ArrayValidator($numberSchema))

    testValidator<unknown, unknown[][]>(
        $arrayOfArrayOfNumber,
        { asserts: [[0]] },
        { asserts: [0], error: true }
    )

})