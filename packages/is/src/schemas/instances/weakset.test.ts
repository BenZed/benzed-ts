import { $weakset } from './weakset'

import { describe } from '@jest/globals'

import { testValidator, testValidationContract } from '../../util.test'

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