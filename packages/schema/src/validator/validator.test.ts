import { Validator } from './validator'

import { Detail, TypeAsserter, Transform } from './traits'

import { isString } from '@benzed/util'
import { testValidator } from '../util.test'

//// Setup ////

const $string = new class String 

    extends Validator<unknown, string> 

    // we arn't using Trait.use here for two reasons:
    // 1) Trait.use does not support type parameters, which we need
    // 2) the TypeAsserter and Detailer trait only defines abstract instance properties
    //    so Trait.use wouldn't affect the implementation, anyway
    implements 
        TypeAsserter<unknown, string>, 
        Transform<unknown, string>, 
        Detail<unknown, string> {

    readonly isValid = isString

    readonly detail = 'Must be a string'

    readonly transform = (i: unknown) => this.isValid(i) ? i.trim() : i

}

//// Tests ////

describe(`${$string.name} validator tests`, () => {

    testValidator<unknown,string>(
        $string,
        { asserts: 'Hello world!', output: 'Hello world!' },
        { asserts: '3' },
        { transforms: 3, error: $string.detail },
        { transforms: '', output: '' },
    )

})
