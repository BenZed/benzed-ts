import { omit } from './omit'

import { it, expect, describe } from '@jest/globals'

//// Tests ////
describe('omit', () => {
    const $$symbol = Symbol('symbol-key')

    it('omits enumerable properties from provided object', () => {
        // given
        const input = { a: 1, b: 2, c: 3, [$$symbol]: 4 }
        // when
        const output = omit(input, 'a', 'c')
        // then
        expect(output).toEqual({ b: 2, [$$symbol]: 4 }) 
    })

    it('omits Symbol-based properties from provided object', () => {
        // given
        const input = { a: 1, b: 2, c: 3, [$$symbol]: 4}
        // when
        const output = omit(input, $$symbol)
        // then
        expect(output).toEqual({ a: 1, b: 2, c: 3 })
    })

    it('still works without providing keys', () => {
        // given
        const input = { a: 1, b: 2, c: 3}
        // when
        const output = omit(input)
        // then
        expect(output).toEqual({ a: 1, b: 2, c: 3})
    })

})
