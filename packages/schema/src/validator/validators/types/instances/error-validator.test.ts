import { ErrorValidator } from './error-validator'

import { describe } from '@jest/globals'

import { testValidator, testValidationContract } from '../../../../util.test'

//// Setup ////

const $error = new ErrorValidator()

//// Tests ////

describe(`${$error.name} validator contract tests`, () => {

    testValidationContract<unknown, Error>(
        $error,
        {
            validInput: new Error('Exception'),
            invalidInput: 0
        }
    )

})

describe(`${$error.name} validator tests`, () => {

    testValidator(
        $error,
        { asserts: new Error('Problem') },
    )

})