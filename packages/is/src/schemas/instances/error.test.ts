import { $error } from './error'

import { describe } from '@jest/globals'

import { testValidator, testValidationContract } from '../../util.test'

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