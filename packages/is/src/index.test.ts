import { nil } from '@benzed/util'
import { Optional, ReadOnly } from '@benzed/schema'
import { test } from '@jest/globals'

import { is } from './index'

import { expectTypeOf } from 'expect-type'
import { String } from './schemas'
import { Is } from './is'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/

////  ////

const value: unknown = NaN

//// Tests ////

describe('is.string', () => {

    it('guards strings', () => {
        expect(is.string('ace')).toBe(true)
        if (is.string(value))
            expectTypeOf(value).toEqualTypeOf<string>()
    })

    test('validates', () => {
        expect(is.string.validate('ace')).toEqual('ace')
    })

    test('perserves builder methods', () => {
        expect(is.string.trim()('ace')).toBe(true)
        expect(is.string.trim()(' ace ')).toBe(false)
    })

    test('type', () => {
        expectTypeOf(is.string).toEqualTypeOf<Is<String>>()
        expectTypeOf(is.string.trim()).toEqualTypeOf<Is<String>>()
    })

})

describe('is(is.string, is.boolean)', () => {

    it('guards', () => {

        const isStringOrBoolean = is(is.string, is.boolean)

        console.log(isStringOrBoolean)
        
    })

})

describe('is.string.optional', () => {

    test('guards', () => {
        expect(is.string.optional(nil)).toBe(true)
        expect(is.string.optional('')).toBe(true)
        expect(is.string.optional(1)).toBe(false)
    })

    test('validates', () => {
        expect(is.string.optional.validate(nil)).toEqual(nil)
    })

    test('required', () => {
        expect(is.string.optional(nil)).toBe(true)
        expect(is.string.optional.required(nil)).toBe(false)
    }) 

    test('type', () => {
        expectTypeOf(is.string.optional).toEqualTypeOf<Is<Optional<String>>>()
        expectTypeOf(is.string.optional.optional).toEqualTypeOf<Is<Optional<String>>>()
        expectTypeOf(is.string.optional.required).toEqualTypeOf<Is<String>>()
    })

})

describe('is.optional.string', () => {

    it('is.optional.string', () => {
        expect(is.optional.string).toEqual(is.string.optional)
    })

})

describe('is.string.readonly', () => {

    test('guards', () => {
        expect(is.string.readonly('sup')).toBe(true)
        if (is.string.readonly(value))
            expectTypeOf(value).toEqualTypeOf<string>()
    })

    test('type', () => {
        expectTypeOf(is.string.readonly).toEqualTypeOf<Is<ReadOnly<String>>>()
    })

})

describe('is.boolean', () => {

    test('guards', () => {
        expect(is.boolean(true)).toBe(true)
        expect(is.boolean('hello')).toBe(false)
        if (is.boolean(value))
            expectTypeOf(value).toEqualTypeOf<boolean>()
    })

})
