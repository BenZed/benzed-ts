import { isNumber, isString } from '@benzed/util'
import Validator from '../validator'
import Cast from './cast'

import { testValidator } from '../../util.test'
import { AssertType } from './assert'

//// Setup ////

const $number = new class Numeric 

    extends Validator<unknown, number> 

    // we arn't using Trait.use here for two reasons:
    // 1) Trait.use does not support type parameters, which we need
    // 2) the Cast trait only defines abstract instance properties
    //    so Trait.use wouldn't affect the implementation, anyway
    implements Cast<unknown, number>, AssertType<unknown, number> {

    isValid = isNumber

    cast(input: unknown) {
        return isString(input)
            ? parseFloat(input)
            : input
    }
 
}

//// Tests ////

describe(`${$number.name} validator tests`, () => {

    testValidator<unknown, number>(
        $number,

        // assertion tests; tests that perform no transformations, just check whether
        // the given value is valid or not
        { asserts: '100', error: true },
        { asserts: 'nun', error: true },

        // cast tests; tests that perform a cast, and throw if that cast 
        // does not result in a valid output
        { transforms: '75', output: 75 },
        { transforms: '124', output: 124 },
        { transforms: '~15-', error: true },
        { transforms: '001', output: 1 },
        { transforms: '4.5', output: 4.5 },
        { transforms: '123.45', output: 123.45 },
        { transforms: '123.00', output: 123 },
        { transforms: '1,234.56', output: 1 }, 
    ) 

})

describe(`${Cast.name} static property tests`, () => {

    test(`${Cast.name} is method`, () => {
        expect(Cast.is($number)).toBe(true)
        expect(Cast.is({ cast: () => null })).toBe(true)
        expect(Cast.is(null)).toBe(false)
        expect(Cast.is({ cast: 123 })).toBe(false)
        expect(Cast.is({})).toBe(false)
    })

})
