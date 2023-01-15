import { test } from '@jest/globals'
import { expectTypeOf } from 'expect-type'

import { Is, IS } from './is'
import { isString, String, Boolean, Number, ArrayOf } from '../schema'
import { Or } from './or'
import { nil } from '@benzed/util'
import { Optional } from './optional'
import { Readonly } from './readonly'

//// Tests ////

const is = (() => void 0) as unknown as IS

test.skip('is(string)', () => {
    const isStr = is(isString)
    expect(isStr('str')).toBe(true)
    expect(isStr(0)).toBe(false)
    expectTypeOf(isStr.validate('str')).toEqualTypeOf('str')
    expectTypeOf(isStr).toEqualTypeOf<<String>>()
})

test.skip('is.string', () => {
    const isStr = is.string
    expect(isStr('str')).toBe(true)
    expect(isStr(0)).toBe(false)
    expectTypeOf(isStr.validate('str')).toEqualTypeOf('str')
    expectTypeOf(isStr).toEqualTypeOf<<String>>()

    // Inherits getters
    const isTrimStr = is.string.trim
    expectTypeOf(isTrimStr).toEqualTypeOf<<String>>()

    // Inherits methods
    const isHashTag = is.string.startsWith('#')
    expectTypeOf(isHashTag).toEqualTypeOf<<String>>()
})

test.skip('is.boolean.or.string', () => {
    const isBoolOrString = is.boolean.or.string

    expect(isBoolOrString('str')).toEqual(true)
    expect(isBoolOrString(true)).toEqual(true)
    expect(isBoolOrString(0)).toEqual(false)
    expectTypeOf(isBoolOrString.validate(true)).toEqualTypeOf<string | boolean>()
    expectTypeOf(isBoolOrString).toEqualTypeOf<<Or<[Boolean, String]>>>()

    // Inherits last getters
    const isBoolOrTrimString = is.boolean.or.string.trim
    expectTypeOf(isBoolOrTrimString).toEqualTypeOf<<Or<[Boolean, String]>>>()

    // Inherits last method
    const isStringOrNegativeNumber = is.string.or.number.range('<', 0)
    expectTypeOf(isStringOrNegativeNumber).toEqualTypeOf<<Or<[Boolean, String]>>>()

})

test.skip('isSingleCharOrDoubleCharOrNegativeNumber', () => {

    const isHashOrTagOrNegativeNumber = is
        .string.startsWith('#')
        .or.string.startsWith('<').endsWith('/>')
        .or.number.range('<', 0)

    expectTypeOf(isHashOrTagOrNegativeNumber).toMatchTypeOf<<Or<[String, String, Number]>>>()

})

test.skip('is.array.of.string', () => {

    const isArrayOfString = is.array.of.string
    expect(isArrayOfString(['ace'])).toBe(true)
    expect(isArrayOfString([])).toBe(true)
    expect(isArrayOfString([0])).toBe(false)
    expectTypeOf(isArrayOfString).toMatchTypeOf<<ArrayOf<String>>>()

})

test.skip('is.array.optional.of.number', () => {
    const isOptionalArrayOfNumber = is.array.optional.of.number
    expect(isOptionalArrayOfNumber([1])).toBe(true)
    expect(isOptionalArrayOfNumber([])).toBe(true)
    expect(isOptionalArrayOfNumber(0)).toBe(false)
    expect(isOptionalArrayOfNumber(nil)).toBe(true)
    expectTypeOf(isOptionalArrayOfNumber)
        .toMatchTypeOf<<Optional<ArrayOf<Number>>>>()
})

test.skip('is.array.readonly.of.number', () => {
    const isReadonlyArrayOfNumber = is.array.readonly.of.number
    expect(isReadonlyArrayOfNumber([1])).toBe(true)
    expect(isReadonlyArrayOfNumber([])).toBe(true)
    expect(isReadonlyArrayOfNumber(0)).toBe(false)
    expect(isReadonlyArrayOfNumber(nil)).toBe(true)
    expectTypeOf(isReadonlyArrayOfNumber)
        .toMatchTypeOf<<Readonly<ArrayOf<Number>>>>()
})

test.skip('is.array.optional.readonly.of.number', () => {
    const isOptionalReadonlyArrayOfNumber = is.array.optional.readonly.of.number
    expect(isOptionalReadonlyArrayOfNumber([1])).toBe(true)
    expect(isOptionalReadonlyArrayOfNumber([])).toBe(true)
    expect(isOptionalReadonlyArrayOfNumber(0)).toBe(false)
    expect(isOptionalReadonlyArrayOfNumber(nil)).toBe(true)
    expectTypeOf(isOptionalReadonlyArrayOfNumber)
        .toMatchTypeOf<<Readonly<Optional<ArrayOf<Number>>>>>()
})

test.skip('is.array.of.array.of.boolean', () => {
    const isArrayOfArrayOfBoolean = is.array.of.array.of.boolean
    expect(isArrayOfArrayOfBoolean([[1]])).toBe(true)
    expect(isArrayOfArrayOfBoolean([[]])).toBe(true)
    expect(isArrayOfArrayOfBoolean(['hey'])).toBe(false)
    expectTypeOf(isArrayOfArrayOfBoolean)
        .toMatchTypeOf<<ArrayOf<ArrayOf<Boolean>>>>()
})

test.skip('is.shape', () => {

    const isVector = is.shape({
        x: is.number.readonly,
        y: is.number.readonly
    })

    expectTypeOf(isVector)
        .toEqualTypeOf<<Shape<{ x: Readonly<Number>, y: Readonly<Number> }>>>()
})

test.skip('is.string.optional', () => {
    const isOptionalString = is.string.optional
})