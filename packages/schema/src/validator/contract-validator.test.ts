import { ContractValidator } from './contract-validator'

import { describe } from '@jest/globals'

import { testValidator, testValidationContract } from '../util.test'

//// Tests ////

const $example = new class extends ContractValidator<unknown, string> {

    readonly name = 'example'

    isValid(value: unknown): value is string {
        return typeof value === 'string'
    }

}

describe(`${$example.name} validator contract tests`, () => {
    testValidationContract<unknown, string>(
        $example,
        {
            validInput: 'string',
            invalidInput: 0,
        }
    )
})

describe(`${$example.name} validator tests`, () => {
    testValidator<unknown, string>(
        $example,
        { transforms: '0' },
        { asserts: '0' },
        { asserts: false, error: true },
    )
})