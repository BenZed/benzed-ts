import { test } from '@jest/globals'
import { expectTypeOf } from 'expect-type'

import { Is, IS } from './is'
import { isString, IsString, IsBoolean, IsNumber, IsArrayOf } from '../schema'
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
    expectTypeOf(isStr).toEqualTypeOf<Is<IsString>>()
})

test.skip('is.string', () => {
    const isStr = is.string
    expect(isStr('str')).toBe(true)
    expect(isStr(0)).toBe(false)
    expectTypeOf(isStr.validate('str')).toEqualTypeOf('str')
    expectTypeOf(isStr).toEqualTypeOf<Is<IsString>>()

    // Inherits getters
    const isTrimStr = is.string.trim
    expectTypeOf(isTrimStr).toEqualTypeOf<Is<IsString>>()

    // Inherits methods
    const isHashTag = is.string.startsWith('#')
    expectTypeOf(isHashTag).toEqualTypeOf<Is<IsString>>()
})

test.skip('is.boolean.or.string', () => {
    const isBoolOrString = is.boolean.or.string

    expect(isBoolOrString('str')).toEqual(true)
    expect(isBoolOrString(true)).toEqual(true)
    expect(isBoolOrString(0)).toEqual(false)
    expectTypeOf(isBoolOrString.validate(true)).toEqualTypeOf<string | boolean>()
    expectTypeOf(isBoolOrString).toEqualTypeOf<Is<Or<[IsBoolean, IsString]>>>()

    // Inherits last getters
    const isBoolOrTrimString = is.boolean.or.string.trim
    expectTypeOf(isBoolOrTrimString).toEqualTypeOf<Is<Or<[IsBoolean, IsString]>>>()

    // Inherits last method
    const isStringOrNegativeNumber = is.string.or.number.range('<', 0)
    expectTypeOf(isStringOrNegativeNumber).toEqualTypeOf<Is<Or<[IsBoolean, IsString]>>>()

})

test.skip('isSingleCharOrDoubleCharOrNegativeNumber', () => {

    const isHashOrTagOrNegativeNumber = is
        .string.startsWith('#')
        .or.string.startsWith('<').endsWith('/>')
        .or.number.range('<', 0)

    expectTypeOf(isHashOrTagOrNegativeNumber).toMatchTypeOf<Is<Or<[IsString, IsString, IsNumber]>>>()

})

test.skip('is.array.of.string', () => {

    const isArrayOfString = is.array.of.string
    expect(isArrayOfString(['ace'])).toBe(true)
    expect(isArrayOfString([])).toBe(true)
    expect(isArrayOfString([0])).toBe(false)
    expectTypeOf(isArrayOfString).toMatchTypeOf<Is<IsArrayOf<IsString>>>()

})

test.skip('is.array.optional.of.number', () => {
    const isOptionalArrayOfNumber = is.array.optional.of.number
    expect(isOptionalArrayOfNumber([1])).toBe(true)
    expect(isOptionalArrayOfNumber([])).toBe(true)
    expect(isOptionalArrayOfNumber(0)).toBe(false)
    expect(isOptionalArrayOfNumber(nil)).toBe(true)
    expectTypeOf(isOptionalArrayOfNumber)
        .toMatchTypeOf<Is<Optional<IsArrayOf<IsNumber>>>>()
})

test.skip('is.array.readonly.of.number', () => {
    const isReadonlyArrayOfNumber = is.array.readonly.of.number
    expect(isReadonlyArrayOfNumber([1])).toBe(true)
    expect(isReadonlyArrayOfNumber([])).toBe(true)
    expect(isReadonlyArrayOfNumber(0)).toBe(false)
    expect(isReadonlyArrayOfNumber(nil)).toBe(true)
    expectTypeOf(isReadonlyArrayOfNumber)
        .toMatchTypeOf<Is<Readonly<IsArrayOf<IsNumber>>>>()
})

test.skip('is.array.optional.readonly.of.number', () => {
    const isOptionalReadonlyArrayOfNumber = is.array.optional.readonly.of.number
    expect(isOptionalReadonlyArrayOfNumber([1])).toBe(true)
    expect(isOptionalReadonlyArrayOfNumber([])).toBe(true)
    expect(isOptionalReadonlyArrayOfNumber(0)).toBe(false)
    expect(isOptionalReadonlyArrayOfNumber(nil)).toBe(true)
    expectTypeOf(isOptionalReadonlyArrayOfNumber)
        .toMatchTypeOf<Is<Readonly<Optional<IsArrayOf<IsNumber>>>>>()
})

test.skip('is.array.of.array.of.boolean', () => {
    const isArrayOfArrayOfBoolean = is.array.of.array.of.boolean
    expect(isArrayOfArrayOfBoolean([[1]])).toBe(true)
    expect(isArrayOfArrayOfBoolean([[]])).toBe(true)
    expect(isArrayOfArrayOfBoolean(['hey'])).toBe(false)
    expectTypeOf(isArrayOfArrayOfBoolean)
        .toMatchTypeOf<Is<IsArrayOf<IsArrayOf<IsBoolean>>>>()
})

test.skip('is.shape', () => {

    const isVector = is.shape({
        x: is.number.readonly,
        y: is.number.readonly
    })

    expectTypeOf(isVector)
        .toEqualTypeOf<Is<Shape<{ x: Readonly<IsNumber>, y: Readonly<IsNumber> }>>>()
})

test.skip('is.string.optional', () => {
    const isOptionalString = is.string.optional
})