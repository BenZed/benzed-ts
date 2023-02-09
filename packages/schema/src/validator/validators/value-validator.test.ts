
import { ValueValidator } from './value-validator'

import { describe } from '@jest/globals'

import { testValidator, testValidationContract } from '../../util.test'
 
//// Setup ////

const $hello = new ValueValidator('hello', true)

//// Tests ////

describe(`${$hello.name} validator tests`, () => { 
    testValidator<unknown, 'hello'>(
        $hello, 
        { asserts: 'hello' },
        { transforms: 0, output: 'hello' },
        { asserts: 'no-bueno', error: true }
    ) 
})

describe(`${$hello.name} validator contract tests`, () => {

    testValidationContract<unknown, 'hello'>(
        $hello,
        {
            validInput: 'hello',
            invalidInput: 1,
            transforms: { invalidInput: {}, validOutput: 'hello' }
        }
    )

})
