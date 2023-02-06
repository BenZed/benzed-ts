import { isNumber, isString, nil, pick } from '@benzed/util'

import { ArrayValidator } from './array-validator'
import { TypeValidator } from '../type-validator'

import { describe } from '@jest/globals'

import { Schema } from '../schema'

import { 
    testValidator, 
    testValidationContract 
} from '../../../util.test'

import { $$settings, ValidatorSettings } from '../../validate-struct'

//// Setup ////

const $number = new class NumberValidator extends TypeValidator<number> {

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

const $numberSchema = new Schema($number)
 
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

    type AONS = ValidatorSettings<typeof $arrayOfNumber>
    type NONS = ValidatorSettings<typeof $number>

    const $arrayOfDefaultZeros = $arrayOfNumber.default(() => 0)

    testValidator<unknown, number[]>(
        $arrayOfDefaultZeros,
        { asserts: [nil, nil], error: true },
        { transforms: [nil, nil], output: [0, 0] },
    )

})