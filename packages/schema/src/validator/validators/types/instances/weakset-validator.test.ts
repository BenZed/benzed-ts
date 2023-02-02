import { WeakSetValidator } from './weakset-validator'

import { describe } from '@jest/globals'

import { testValidator, testValidationContract } from '../../../../util.test'

//// Setup ////

const $weakset = new WeakSetValidator()

//// Tests ////

describe(`${$weakset.name} validator contract tests`, () => {

    testValidationContract<unknown, WeakSet<object>>(
        $weakset,
        {
            validInput: new WeakSet(),
            invalidInput: 0
        }
    )

})

describe(`${$weakset.name} validator tests`, () => {

    testValidator<unknown, WeakSet<object>>(
        $weakset,
        { asserts: new WeakSet() },
    )

})