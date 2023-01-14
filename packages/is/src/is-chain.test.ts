
import { isString, TypeOf } from '@benzed/util'
import { test } from '@jest/globals'
import { expectTypeOf } from 'expect-type'

import { IS, Is, Or, Str, Bool, Shape, Num, Readonly } from './is-chain'

//// Tests ////

const is = (() => void 0) as unknown as IS
const string = isString as Str

test.skip('is(string)', () => {
    const isStr = is(string)
    expect(isStr('str')).toBe(true)
    expect(isStr(0)).toBe(false)
    expectTypeOf(isStr.validate('str')).toEqualTypeOf('str')
    expectTypeOf(isStr).toEqualTypeOf<Is<Str>>()
})

test.skip('is.string', () => {
    const isStr = is.string
    expect(isStr('str')).toBe(true)
    expect(isStr(0)).toBe(false)
    expectTypeOf(isStr.validate('str')).toEqualTypeOf('str')
    expectTypeOf(isStr).toEqualTypeOf<Is<Str>>()

    // Inherits getters
    const isTrimStr = is.string.trim
    expectTypeOf(isTrimStr).toEqualTypeOf<Is<Str>>()

    // Inherits methods
    const isChar = is.string.length('==', 1)
    expectTypeOf(isChar).toEqualTypeOf<Is<Str>>()
})

test.skip('is.boolean.or.string', () => {
    const isStrOrBool = is.boolean.or.string

    expect(isStrOrBool('str')).toEqual(true)
    expect(isStrOrBool(true)).toEqual(true)
    expect(isStrOrBool(0)).toEqual(false)
    expectTypeOf(isStrOrBool.validate(true)).toEqualTypeOf<string | boolean>()
    expectTypeOf(isStrOrBool).toEqualTypeOf<Is<Or<[Bool, Str]>>>()

    // Inherits last getters
    const isBoolOrTrimString = is.boolean.or.string.trim
    expectTypeOf(isBoolOrTrimString).toEqualTypeOf<Is<Or<[Bool, Str]>>>()

    // Inherits last method
    const isStringOrNegativeNumber = is.string.or.number.range('<', 0)
    expectTypeOf(isStringOrNegativeNumber).toEqualTypeOf<Is<Or<[Bool, Str]>>>()

})

test.skip('isSingleCharOrDoubleCharOrNegativeNumber', () => {

    const isSingleCharOrDoubleCharOrNegativeNumber = is
        .string.length('==', 1)
        .or.string.length('==', 2)
        .or.number.range('<', 0)

    expectTypeOf(isSingleCharOrDoubleCharOrNegativeNumber).toEqualTypeOf<Is<Or<[Str, Bool]>>>()

})

test.skip('is.shape', () => {

    const isVector = is.shape({
        x: is.number.readonly,
        y: is.number.readonly
    })

    expectTypeOf(isVector).toEqualTypeOf<Is<Shape<{ x: Readonly<Num>, y: Readonly<Num> }>>>()
})

test.skip('is.string.optional', () => {
    const isOptionalString = is.string.optional
})