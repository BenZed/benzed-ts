import { $regexp } from './regexp'

import { describe } from '@jest/globals'

import { testValidator, testValidationContract } from '../../util.test'

//// Tests ////

describe(`${$regexp.name} validator contract tests`, () => {

    testValidationContract<unknown, RegExp>(
        $regexp,
        {
            validInput: /base/,
            invalidInput: 0
        }
    )

})

describe(`${$regexp.name} validator tests`, () => {

    testValidator<unknown, RegExp>(
        $regexp,
        { asserts: /ace/ },
    )

})