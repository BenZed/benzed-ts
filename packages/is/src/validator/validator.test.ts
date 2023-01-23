import { asNil, isArray, isNumber, isObject, isString as _isString } from '@benzed/util'
import { Validator } from './validator'

import { expectTypeOf } from 'expect-type'
import Validate from './validate'

//// Type ////

const isString = new Validator({
    error: 'must be a string',
    transform: i => asNil(i) && !isObject(i) ? `${i}` : i,
    is: _isString 
})

//// Tests ////

describe(`${Validator.name}()`, () => {

    it('options.is', () => {
        expect(isString('hey')).toEqual('hey')
        expect(() => isString({})).toThrow('must be a string')
    })

    it('options.transform', () => {
        expect(isString(10)).toEqual('10')
        expect(isString(true)).toEqual('true')
        expect(() => isString(null)).toThrow('must be a string')
    })

    it('options.error', () => {
        expect(() => isString(null)).toThrow('must be a string')
    })

})

describe('Constructor signatures', () => {

    const isArrayOfNumber = new Validator({
        of: isNumber,
        is(input: unknown): input is number[] {
            return isArray(input, this.of)
        },
        error: 'Must be an array of numbers'
    })

    it('partial settings', () => {
        expectTypeOf(isString).toEqualTypeOf<Validate<unknown,string>>()
    })

    it('super settings', () => {
        expectTypeOf(isArrayOfNumber).toEqualTypeOf<{
            of: <N extends number = number>(i: unknown) => i is N
            is(input: unknown): input is number[]
            error: string
        } & Validate<unknown, number[]>>()
    })

})