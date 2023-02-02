import { NullValidator } from './null-validator'

import { describe } from '@jest/globals'

import { testValidator, testValidationContract } from '../../util.test'

//// Setup ////

const $null = new NullValidator(true)

//// Tests ////

describe(`${$null.name} validator contract tests`, () => {

    testValidationContract(
        $null,
        {
            validInput: null,
            invalidInput: 0,
            transforms: { invalidInput: 0, validOutput: null },
        }
    )

    describe(`${$null.name} validator tests`, () => {
        testValidator(
            $null,
            { asserts: null },
        )
    })
})

