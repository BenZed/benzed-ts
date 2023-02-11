import { isNumber } from '@benzed/util'

import { describe } from '@jest/globals'

import { TypeValidator } from './type-validator'
import { PipeValidator } from './pipe-validator'
import { ContractValidator } from '../contract-validator'

import {
    testValidator,
    testValidationContract
} from '../../util.test'

//// Setup ////

const $number = new class extends TypeValidator<number> {
    readonly name = 'Number'
    readonly isValid = isNumber
}

const $positive = new class extends ContractValidator<number, number> {

    isValid(input: number): boolean {
        return input >= 0
    }

    message(): string {
        return 'Must be positive'
    }
}

//// Tests ////

describe(`${PipeValidator.name} validator tests`, () => {

    const $positiveNumber = new PipeValidator($number, $positive)

    testValidationContract(
        $positiveNumber,
        {
            validInput: 0,
            invalidInput: -5
        }
    )

    testValidator<unknown, number>(
        $positiveNumber,
        { transforms: 0 },
        { asserts: 0 },
        { asserts: -5, error: 'Must be positive' },
        { asserts: 'ace', error: 'Must be a Number' }
    )

})