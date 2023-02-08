import { $null } from './null'

import { describe } from '@jest/globals'

import { testValidator, testValidationContract } from '../../util.test'

//// Tests ////

describe(`${$null.name} validator contract tests`, () => {

    testValidationContract(
        $null,
        {
            validInput: null,
            invalidInput: 0,
            transforms: { invalidInput: 0, validOutput: null },
        }
    )

    testValidator(
        $null,
        { asserts: null },
    )

})

