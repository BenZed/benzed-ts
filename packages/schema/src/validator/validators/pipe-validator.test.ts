import { isNumber, pick } from '@benzed/util'

import { describe } from '@jest/globals'

import { testValidator } from '../../util.test'
import { Validator } from '../validator'

import { ContractValidator } from './contract-validator'
import { TypeValidator } from './contract-validators'
import { PipeValidator } from './pipe-validator'

//// Setup ////

const $number = new class Number extends TypeValidator<number> {
    readonly isValid = isNumber
}

const $positive = new class Positive extends ContractValidator<number, number> {

    isValid(input: number): boolean {
        return input >= 0
    }

}

const $positiveNumber = new class extends PipeValidator<unknown, number> {
    get validators() {
        return [$number, $positive] as const
    }

    get [Validator.state](): Pick<this, 'validators'> {
        return pick(this, 'validators')
    }
}

//// Tests ////

describe(`${PipeValidator.name} validator tests`, () => {

    testValidator<unknown, number>(
        $positiveNumber,
        { transforms: 0 },
        { asserts: 0 },
        { asserts: -5, error: 'must be Positive' },
        { asserts: 'ace', error: 'must be Number' }
    )

})