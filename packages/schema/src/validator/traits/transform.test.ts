
import { isNumber, isString } from '@benzed/util'
import Validator from '../validator'
import Transform from './transform'

import { testValidator } from '../../util.test'

//// Setup ////

const $number = new class Numeric 

    extends Validator<unknown, number> 

    // we arn't using Trait.use here for two reasons:
    // 1) Trait.use does not support type parameters, which we need
    // 2) the Transform trait only defines abstract instance properties
    //    so Trait.use wouldn't affect the implementation, anyway
    implements Transform<unknown, number> {

    transform(input: unknown): unknown {
        return isNumber(input)
            ? input 
            : isString(input)
                ? parseFloat(input)
                : NaN
    }

}

//// Tests ////

describe(`${$number.name} validator tests`, () => {

    testValidator<unknown, number>(
        $number,
        // assertion tests; tests that perform no transformations, just check weather
        // the given value is valid or not
        { asserts: 100 },
        { asserts: 'nun', error: true },
        { asserts: '1,234.56', error: true },
        { asserts: true, error: true },
        { asserts: false, error: true },
        { asserts: null, error: true },
        { asserts: undefined, error: true },
        { asserts: {}, error: true },
        { asserts: 'nun', error: true },
  
        // transform tests; tests that perform transformations, and throw
        // if those transformations do not result in a valid output
        { transforms: '100', output: 100 },
        { transforms: '75', output: 75 },
        { transforms: ' 124', output: 124 },
        { transforms: '~15-', output: NaN },
        { transforms: '001', output: 1 },
        { transforms: '4.5', output: 4.5 },
        { transforms: '123.45', output: 123.45 },
        { transforms: '123.00', output: 123 },
        { transforms: '1,234.56', output: 1 },
        { transforms: {}, output: NaN },
        { transforms: null, output: NaN },
        { transforms: undefined, output: NaN },
        { transforms: '', output: NaN },
        { transforms: true, output: NaN },
        { transforms: false, output: NaN },
        { transforms: Infinity, output: Infinity },
        { transforms: -Infinity, output: -Infinity },
        { transforms: '100.50', output: 100.50 },
        { transforms: '-100.50', output: -100.50 },
        { transforms: '-100', output: -100 },
        { transforms: ' 100.50 ', output: 100.50 },
        { transforms: '1000000000000000.50', output: 1000000000000000.50 },
        { transforms: '-1000000000000000.50', output: -1000000000000000.50 },
        { transforms: '-1000000000000000000', output: -1000000000000000000 },
        { transforms: ' 1000000000000000.50 ', output: 1000000000000000.50 },
    )
  
})

describe(`${Transform.name} static property tests`, () => {

    test(`${Transform.name} is method returns true if input has Transform trait`, () => {
        expect(Transform.is($number)).toBe(true)
    })
  
    test(`${Transform.name} is method returns false if input does not have Transform trait`, () => {
        expect(Transform.is({})).toBe(false)
    })

})