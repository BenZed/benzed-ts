import { isSymbol } from '@benzed/util'
import Validator from '../validator'
import Assert from './assert'

import { testValidator } from '../../util.test'
import ValidationContext from '../../validation-context'

//// Setup ////

const $symbol = new class Symbolic extends Validator<unknown, symbol> implements Assert<unknown, symbol> {

    readonly isValid = isSymbol

}()

//// Tests ////

describe(`${$symbol.name} validator tests`, () => {

    testValidator<unknown, symbol>(
        $symbol,

        { asserts: Symbol() },
        { asserts: Symbol('test') },
        { asserts: 100, error: true },
        { transforms: Symbol() },
        { transforms: Symbol('test') },
        { transforms: 100, error: true },
    )

})

describe(`${Assert.name} static property tests`, () => {

    test(`${Assert.name} is method`, () => {
        expect(Assert.is($symbol)).toBe(true)
        expect(Assert.is({})).toBe(false)
    })

    test(`${Assert.name} isValid method`, () => {
        const $sym = Symbol()
        expect(Assert.isValid($symbol, new ValidationContext<unknown, symbol>(''), 'valid')).toBe(false)
        expect(Assert.isValid($symbol, new ValidationContext<unknown, symbol>($sym ), $sym )).toBe(true)
    })

})
