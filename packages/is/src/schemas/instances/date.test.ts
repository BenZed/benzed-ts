import { $date } from './date'

import { describe } from '@jest/globals'

import { testValidator, testValidationContract } from '../../util.test'

//// Tests ////

describe(`${$date.name} validator contract tests`, () => {

    const now = new Date()

    testValidationContract<unknown, Date>(
        $date,
        {
            validInput: now,
            invalidInput: new Date(NaN),
            transforms: { invalidInput: 1000, validOutput: new Date(1000) },
        }
    )

})

describe(`${$date.name} validator tests`, () => {

    testValidator<unknown, Date>(
        $date,
        { transforms: 1500, output: new Date(1500) },
    )
})
