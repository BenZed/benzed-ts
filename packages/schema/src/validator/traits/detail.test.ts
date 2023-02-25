
import { fail} from '@benzed/util'
import Validator from '../validator'
import Detail from './detail'

import { testValidator } from '../../util.test'
import Assert from './assert'
import ValidationContext from '../../validation-context'

//// Setup ////

const $number = new class Numeric 

    extends Validator<unknown, number> 

    // we arn't using Trait.use here for two reasons:
    // 1) Trait.use does not support type parameters, which we need
    // 2) the Assert and Detailer trait only defines abstract instance properties
    //    so Trait.use wouldn't affect the implementation, anyway
    implements Assert<unknown, number>, Detail<unknown, number> {

    readonly isValid = fail

    detail() {
        return 'Must be a number.'
    }

}

//// Tests ////

describe(`${$number.name} validator tests`, () => {
    testValidator<unknown, number>(
        $number,
        // assertion tests
        { asserts: NaN, error: 'Must be a number.' },
        { asserts: Infinity, error: 'Must be a number.' },
        { asserts: undefined, error: 'Must be a number.' },
        { asserts: null, error: 'Must be a number.' },
        { asserts: 'hello', error: 'Must be a number.' },
        { asserts: [], error: 'Must be a number.' },
        { asserts: {}, error: 'Must be a number.' },
  
        // transform tests
        { transforms: undefined, error: 'Must be a number.' },
    ) 
})
  
describe(`${Detail.name} static property tests`, () => {
    test(`${Detail.name} is method`, () => {
        expect(Detail.is($number)).toBe(true)
    })
  
    test(`${Detail.name} resolve method`, () => {
        const resolved = Detail.resolve($number, new ValidationContext<unknown,number>(''))
  
        expect(resolved).toBe($number.detail())
    })
})
  