import { nil, TypeOf } from '@benzed/util'

import { test } from '@jest/globals'
import { expectTypeOf } from 'expect-type'

import { To } from './to'
import { Is } from './is'
import { Or } from './or'
import { Optional } from './optional'
import { Readonly } from './readonly'
import { isString, String, Boolean, Number, ArrayOf, isBoolean, isNumber, isNaN, NaN, Value } from '../schema'
import { copy } from '@benzed/immutable'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/ 

//// IS TO ////

const is = new To()

test('is(string)', () => {
    const isStr = is(isString)
    expect(isStr('str')).toBe(true)
    expect(isStr(0)).toBe(false)
    expectTypeOf(isStr.validate('str')).toEqualTypeOf('str')
    expectTypeOf(isStr).toEqualTypeOf<Is<String>>()
})

test('is.string', () => {
    const isStr = is.string
    expect(isStr('str')).toBe(true)
    expect(isStr(0)).toBe(false)
    expectTypeOf(isStr.validate('str')).toEqualTypeOf('str')
    expectTypeOf(isStr).toEqualTypeOf<Is<String>>()

    // Inherits getters
    const isTrimStr = is.string.trim
    expect(isTrimStr(' ')).toBe(false)
    expect(isTrimStr('')).toBe(true)
    expectTypeOf(isTrimStr).toEqualTypeOf<Is<String>>()

    // Inherits methods
    const isHashTag = is.string.startsWith('#')
    expect(isHashTag('#')).toBe(true)
    expect(isHashTag('')).toBe(false)
    expectTypeOf(isHashTag).toEqualTypeOf<Is<String>>()
})

test('is.boolean.or.string', () => {

    const isBoolOrString = is.boolean.or.string

    expect(isBoolOrString('str')).toEqual(true)
    expect(isBoolOrString(true)).toEqual(true)
    expect(isBoolOrString(0)).toEqual(false)
    expectTypeOf(isBoolOrString.validate(true)).toEqualTypeOf<string | boolean>()
    expectTypeOf(isBoolOrString).toEqualTypeOf<Is<Or<[Boolean, String]>>>()

    // Inherits last getters
    const isBoolOrTrimString = is.boolean.or.string.trim
    expectTypeOf(isBoolOrTrimString).toEqualTypeOf<Is<Or<[Boolean, String]>>>()

    // Inherits last method
    const isStringOrNegativeNumber = is.string.or.number.range('<', 0)
    expectTypeOf(isStringOrNegativeNumber).toEqualTypeOf<Is<Or<[Boolean, String]>>>()

}) 

test.skip('isHashOrTagOrNegativeNumber', () => {
    const isHashOrTagOrNegativeNumber = is
        .string.startsWith('#')
        .or.string.startsWith('<').endsWith('/>')
        .or.number.range('<', 0)
    expectTypeOf(isHashOrTagOrNegativeNumber).toMatchTypeOf<Is<Or<[String, String, Number]>>>()
})

test.skip('is.array.of.string', () => {

    const isArrayOfString = is.array.of.string
    expect(isArrayOfString(['ace'])).toBe(true)
    expect(isArrayOfString([])).toBe(true)
    expect(isArrayOfString([0])).toBe(false)
    expectTypeOf(isArrayOfString).toMatchTypeOf<Is<ArrayOf<String>>>()

})

test.skip('is.array.optional.of.number', () => {
    const isOptionalArrayOfNumber = is.array.optional.of.number
    expect(isOptionalArrayOfNumber([1])).toBe(true)
    expect(isOptionalArrayOfNumber([])).toBe(true)
    expect(isOptionalArrayOfNumber(0)).toBe(false)
    expect(isOptionalArrayOfNumber(nil)).toBe(true)
    expectTypeOf(isOptionalArrayOfNumber)
        .toMatchTypeOf<Is<Optional<ArrayOf<Number>>>>()
})

test.skip('is.array.readonly.of.number', () => {
    const isReadonlyArrayOfNumber = is.array.readonly.of.number
    expect(isReadonlyArrayOfNumber([1])).toBe(true)
    expect(isReadonlyArrayOfNumber([])).toBe(true)
    expect(isReadonlyArrayOfNumber(0)).toBe(false)
    expect(isReadonlyArrayOfNumber(nil)).toBe(true)
    expectTypeOf(isReadonlyArrayOfNumber)
        .toMatchTypeOf<Is<Readonly<ArrayOf<Number>>>>()

    const valid = isReadonlyArrayOfNumber.validate([])
    expectTypeOf(valid).toEqualTypeOf<readonly number[]>()
})

test.skip('is.array.optional.readonly.of.number', () => {
    const isOptionalReadonlyArrayOfNumber = is.array.optional.readonly.of.number
    expect(isOptionalReadonlyArrayOfNumber([1])).toBe(true)
    expect(isOptionalReadonlyArrayOfNumber([])).toBe(true)
    expect(isOptionalReadonlyArrayOfNumber(0)).toBe(false)
    expect(isOptionalReadonlyArrayOfNumber(nil)).toBe(true)
    expectTypeOf(isOptionalReadonlyArrayOfNumber)
        .toMatchTypeOf<Is<Readonly<Optional<ArrayOf<Number>>>>>()
})

test.skip('is.array.of.array.of.boolean', () => {
    const isArrayOfArrayOfBoolean = is.array.of.array.of.boolean
    expect(isArrayOfArrayOfBoolean([[1]])).toBe(true)
    expect(isArrayOfArrayOfBoolean([[]])).toBe(true)
    expect(isArrayOfArrayOfBoolean(['hey'])).toBe(false)
    expectTypeOf(isArrayOfArrayOfBoolean)
        .toMatchTypeOf<Is<ArrayOf<ArrayOf<Boolean>>>>()
})

test.skip('is.shape', () => {

    const isVector = is.shape({
        x: is.number.readonly,
        y: is.number.readonly
    })

    expectTypeOf(isVector)
        .toEqualTypeOf<Is<Shape<{ x: Readonly<Number>, y: Readonly<Number> }>>>()
})

test.skip('is.string.optional', () => {
    const isOptionalString = is.string.optional
})

//// Or TO ////

const isBooleanOr = new To(isBoolean)
const isBooleanOrString = isBooleanOr.string
const isBooleanOrStringOrNumber = new To(isBoolean)(isString, isNumber)

it('chain string or boolean example', () => {  

    expectTypeOf(isBooleanOrString).toMatchTypeOf<Or<[Boolean, String]>>()

    expectTypeOf<TypeOf<typeof isBooleanOrString>>().toEqualTypeOf<boolean | string>()

    expect(isBooleanOrString('ace')).toEqual(true)
    expect(isBooleanOrString.validate('ace')).toEqual('ace')

    expect(isBooleanOrString(true)).toEqual(true)
    expect(isBooleanOrString.validate(true)).toEqual(true)

    expect(isBooleanOrString(10)).toEqual(false)
    expect(() => isBooleanOrString.validate(10))
        .toThrow(Error)

})

it('chain string or boolean or number', () => {
    expectTypeOf(isBooleanOrStringOrNumber)
        .toMatchTypeOf<Or<[Boolean, String, Number]>>()
    
    expectTypeOf<TypeOf<typeof isBooleanOrStringOrNumber>>()
        .toEqualTypeOf<boolean | string | number>()

    for (const value of ['string', true, 10])
        expect(isBooleanOrStringOrNumber(value)).toEqual(true)
})

it('chain method also has Or.to signature', () => {

    const isSortOutput = new To(new Value(0))(new Value(1), new Value(-1))

    expect(isSortOutput(1)).toEqual(true)
    expect(isSortOutput(-1)).toEqual(true)
    expect(isSortOutput(0)).toEqual(true)
    expect(isSortOutput(2)).toEqual(false)
})

describe('flattening', () => {
    it('chained schemas are flattened', () => {
        expect(isBooleanOrStringOrNumber.types).toHaveLength(3)
    })
})

it('types are preserved on copy', () => {
    expect(copy(isBooleanOrString).types).toHaveLength(2)
    expect(copy(isBooleanOrString)).not.toBe(isBooleanOrString)
}) 

it('isNaN merges nicely', () => { 
    const isStringOrNaN = new To(isNaN).string
    expectTypeOf(isStringOrNaN).toMatchTypeOf<Or<[String, NaN]>>()
})