import { ContractValidator } from './contract-validator'

import { isString } from '@benzed/util'
import { testValidator } from '../../util.test'
import { copy } from '@benzed/immutable'

import { describe, it, expect } from '@jest/globals'

//// Setup ////

const $string = new class String extends ContractValidator<unknown, string> {

    override isValid(input: unknown): input is string {
        return isString(input)
    }

    override transform(input: unknown) {
        return this.isValid(input) ? input.trim() : input
    }
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

it('survives copy', () => {
    expect(() => copy($string)).not.toThrow()
})