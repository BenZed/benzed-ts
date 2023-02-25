import { ContractValidator } from './contract-validator'

import { isString } from '@benzed/util'
import { testValidator } from '../../util.test'

//// Setup ////

const $string = new class String extends ContractValidator<unknown, string> {

    readonly isValid = isString

    readonly transform = (i: unknown) => this.isValid(i) ? i.trim() : i

}

//// Tests ////

describe(`${$string.constructor.name} validator tests`, () => {

    testValidator<unknown,string>(
        $string,
        { asserts: 'Hello world!', output: 'Hello world!' },
        { asserts: '3' },
        { transforms: 3, error: true },
        { transforms: '', output: '' },
    )

})