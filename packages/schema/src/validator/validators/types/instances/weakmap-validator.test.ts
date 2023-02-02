import { WeakMapValidator } from './weakmap-validator'

import { describe } from '@jest/globals'

import { testValidator, testValidationContract } from '../../../../util.test'

//// Setup ////

const $weakmap = new WeakMapValidator()

//// Tests ////

describe(`${$weakmap.name} validator contract tests`, () => {

    testValidationContract<unknown, WeakMap<object,unknown>>(
        $weakmap,
        {
            validInput: new WeakMap(),
            invalidInput: 0
        }
    )

})

describe(`${$weakmap.name} validator tests`, () => {

    testValidator<unknown, WeakMap<object,unknown>>(
        $weakmap,
        { asserts: new WeakMap() },
    )

})