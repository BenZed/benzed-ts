import { $nan } from './nan'

import { describe } from '@jest/globals'

import { testValidator } from '../../util.test'

//// Tests ////

describe(`${$nan.name} validator contract tests`, () => {

    // testValidationContract( 
    //     $nan.force(true),
    //     {
    //         validInput: NaN,
    //         invalidInput: 0,
    //         transforms: { invalidInput: 0, validOutput: NaN },
    //     }
    // )

    testValidator(
        $nan,
        { asserts: NaN },
        { transforms: 0, error: true },
    )

    testValidator(
        $nan.force(true),
        { asserts: NaN },
        { transforms: 0, output: NaN } 
    )

})

describe('configurable', () => {

    const $namedNan = $nan.named('NotANumber')
    testValidator(
        $namedNan,
        { asserts: 0, error: 'Must be NotANumber' },
    )

})
