import { isNumber } from '@benzed/util'

import { describe } from '@jest/globals'

import { testValidator } from '../util.test'

import { ContractValidator } from './contract-validator'
import { TypeValidator } from './type-validator'
import { PipeValidator } from './pipe-validator'

//// Setup ////

const $number = new class Number extends TypeValidator<number> {
    readonly isValid = isNumber

    readonly message = 'Must be a Number'
}

const $positive = new class Positive extends ContractValidator<number, number> {

    isValid(input: number): boolean {
        return input >= 0
    }

    readonly message = 'Must be positive'

}

const $positiveNumber = new class extends PipeValidator<unknown, number> {
    get validators() {
        return [$number, $positive] as const
    }
}

//// Tests ////

describe(`${PipeValidator.name} validator tests`, () => {

    testValidator<unknown, number>(
        $positiveNumber,
        { transforms: 0 },
        { asserts: 0 },
        { asserts: -5, error: 'Must be positive' },
        { asserts: 'ace', error: 'Must be a Number' }
    )

})