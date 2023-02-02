import { PromiseValidator } from './promise-validator'

import { describe } from '@jest/globals'

import { testValidator, testValidationContract } from '../../util.test'

//// Setup ////

const $promise = new PromiseValidator()

//// Tests ////

describe(`${$promise.name} validator contract tests`, () => {

    testValidationContract<unknown, Promise<unknown>>(
        $promise,
        {
            validInput: Promise.resolve(),
            invalidInput: 0
        }
    )

})

describe(`${$promise.name} validator tests`, () => {

    testValidator<unknown, Promise<unknown>>(
        $promise,
        { asserts: Promise.resolve() },
    )

})