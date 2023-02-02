import { UndefinedValidator } from './undefined-validator'

import { describe } from '@jest/globals'

import { testValidator, testValidationContract } from '../../../util.test'

//// Setup ////

const $undefined = new UndefinedValidator(true)

//// Tests ////

describe(`${$undefined.name} validator contract tests`, () => {

    testValidationContract<unknown, undefined>(
        $undefined,
        {
            validInput: undefined,
            invalidInput: 0,
            transforms: { invalidInput: 0, validOutput: undefined },
        }
    )

    describe(`${$undefined.name} validator tests`, () => {
        testValidator<unknown, undefined>(
            $undefined,
            { asserts: undefined },
        )
    })
})

