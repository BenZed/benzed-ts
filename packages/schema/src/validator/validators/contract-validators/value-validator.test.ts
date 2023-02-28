
import { ValueValidator } from './value-validator'

import { describe } from '@jest/globals'

import { testValidator } from '../../../util.test'
 
//// Setup ////

const $hello = new ValueValidator('hello', true)

//// Tests ////

describe(`${$hello.constructor.name} validator tests`, () => { 
    testValidator<unknown, 'hello'>(
        $hello, 
        { asserts: 'hello' },
        { transforms: 0, output: 'hello' },
        { asserts: 'no-bueno', error: true }
    ) 

})
 