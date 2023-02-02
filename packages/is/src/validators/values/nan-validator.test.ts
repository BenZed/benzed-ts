import { NaNValidator } from './nan-validator'

import { describe } from '@jest/globals'

import { testValidator, testValidationContract } from '../../util.test'

//// Setup ////

const $nan = new NaNValidator(true)

//// Tests ////

describe(`${$nan.name} validator contract tests`, () => {

    testValidationContract(
        $nan,
        {
            validInput: NaN,
            invalidInput: 0,
            transforms: { invalidInput: 0, validOutput: NaN },
        }
    )

    describe(`${$nan.name} validator tests`, () => {
        testValidator(
            $nan,
            { asserts: NaN },
        )
    })
})

