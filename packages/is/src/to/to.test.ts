
import { nil, TypeOf } from '@benzed/util'
import { copy } from '@benzed/immutable'

import { test } from '@jest/globals'

import { expectTypeOf } from 'expect-type'

import { To } from './to'
import { Is } from '../is'
import { Or } from '../or'
import { Optional } from '../optional'
import { ReadOnly } from '../readonly'

import {
    String, 
    isString, 

    ArrayOf, 

    Boolean, 
    isBoolean, 

    Number, 
    isNumber, 

    NaN, 
    isNaN, 

    Value,
    Tuple,

    Shape
} from '../../schema'

//// EsLint ////  

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// IS TO ////

const is = To.is

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

test('isHashOrTagOrNegativeNumber', () => {
    const isHashOrTagOrNegativeNumber = is
        .string.startsWith('#')
        .or.string.startsWith('<').endsWith('/>')
        .or.number.range('<', 0)
    expectTypeOf(isHashOrTagOrNegativeNumber).toMatchTypeOf<Is<Or<[String, String, Number]>>>()
})

test('is.array.of.string', () => {

    const isArrayOfString = is.array.of.string  

    expect(isArrayOfString(['ace'])).toBe(true)
    expect(isArrayOfString([])).toBe(true)
    expect(isArrayOfString([0])).toBe(false)
    expectTypeOf(isArrayOfString).toMatchTypeOf<Is<ArrayOf<String>>>()
})

test('is.array.optional.of.number', () => { 

    const isOptionalArrayOfNumber = is.array.optional.of.number  

    expect(isOptionalArrayOfNumber([1])).toBe(true)
    expect(isOptionalArrayOfNumber([])).toBe(true)
    expect(isOptionalArrayOfNumber(0)).toBe(false)
    expect(isOptionalArrayOfNumber(nil)).toBe(true)
    expectTypeOf(isOptionalArrayOfNumber)
        .toMatchTypeOf<Is<Optional<ArrayOf<Number>>>>()

    const valid = isOptionalArrayOfNumber.validate([])
    expectTypeOf(valid).toEqualTypeOf<number[] | undefined>()
}) 

test('is.array.readonly.of.number', () => {
    const isReadonlyArrayOfNumber = is.array.readonly.of.number

    expect(isReadonlyArrayOfNumber([1])).toBe(true)
    expect(isReadonlyArrayOfNumber([])).toBe(true)
    expect(isReadonlyArrayOfNumber(0)).toBe(false)
    expect(isReadonlyArrayOfNumber(nil)).toBe(false)
    expectTypeOf(isReadonlyArrayOfNumber)
        .toMatchTypeOf<Is<ReadOnly<ArrayOf<Number>>>>()

    const valid = isReadonlyArrayOfNumber.validate([])
    expectTypeOf(valid).toEqualTypeOf<readonly number[]>()
})

test('is.array.optional.readonly.of.number', () => {
    const isOptionalReadonlyArrayOfNumber = is.array.optional.readonly.of.number

    expect(isOptionalReadonlyArrayOfNumber([1])).toBe(true)
    expect(isOptionalReadonlyArrayOfNumber([])).toBe(true)
    expect(isOptionalReadonlyArrayOfNumber(0)).toBe(false)
    expect(isOptionalReadonlyArrayOfNumber(nil)).toBe(true)
    expectTypeOf(isOptionalReadonlyArrayOfNumber)
        .toMatchTypeOf<Is<ReadOnly<Optional<ArrayOf<Number>>>>>()

    const valid = isOptionalReadonlyArrayOfNumber.validate([])
    expectTypeOf(valid).toEqualTypeOf<Readonly<number[] | undefined>>()
}) 

test('is.array.of.array.of.boolean', () => { 

    const isArrayOfArrayOfBoolean = is.array.of.array.of.boolean

    expect(isArrayOfArrayOfBoolean([[true]])).toBe(true)
    expect(isArrayOfArrayOfBoolean([[]])).toBe(true)
    expect(isArrayOfArrayOfBoolean(['hey'])).toBe(false)
    expect(isArrayOfArrayOfBoolean([['hey']])).toBe(false)

    const valid = isArrayOfArrayOfBoolean.validate([])
    expectTypeOf(valid)
        .toMatchTypeOf<boolean[][]>() 
})

test('is.string.optional', () => {
    const isOptionalString = is.string.optional
    expect(isOptionalString('hey')).toBe(true)
    expect(isOptionalString(nil)).toBe(true)

    const valid = isOptionalString.validate(nil)
    expectTypeOf(valid)
        .toMatchTypeOf<string | undefined>()
})

test('is.string.or.boolean.or(is.array.of.number.readonly)', () => {
    const isStringOrBooleanOrReadonlyArrayOfNumber = is.string.or.boolean.or(is.array.readonly.of.number)
    expectTypeOf(isStringOrBooleanOrReadonlyArrayOfNumber)
        .toEqualTypeOf<Is<Or<[String, Boolean, ReadOnly<ArrayOf<Number>>]>>>()

    expect(isStringOrBooleanOrReadonlyArrayOfNumber(true)).toBe(true)
    expect(isStringOrBooleanOrReadonlyArrayOfNumber('true')).toBe(true)
    expect(isStringOrBooleanOrReadonlyArrayOfNumber([])).toBe(true)
    expect(isStringOrBooleanOrReadonlyArrayOfNumber([0])).toBe(true)
    expect(isStringOrBooleanOrReadonlyArrayOfNumber(0)).toBe(false)
    expect(isStringOrBooleanOrReadonlyArrayOfNumber([''])).toBe(false)
    expect(isStringOrBooleanOrReadonlyArrayOfNumber([true])).toBe(false)

    const valid = isStringOrBooleanOrReadonlyArrayOfNumber.validate('')
    expectTypeOf(valid).toEqualTypeOf<string | boolean | readonly number[]>()
})

test('is.shape', () => {

    const isVector = is.shape({
        x: is.number.readonly,
        y: is.number.readonly
    })

    expectTypeOf(isVector)
        .toEqualTypeOf<Is<Shape<{ x: ReadOnly<Number>, y: ReadOnly<Number> }>>>()

    const valid = isVector.validate({ x: 0, y: 0 })
    expectTypeOf(valid).toEqualTypeOf<{ readonly x: number, readonly y: number }>()

    const isReadonlyVector = isVector.readonly
    const rValid = isReadonlyVector.validate({ x: 0, y: 0 })
    expectTypeOf(rValid).toEqualTypeOf<{ readonly x: number, readonly y: number }>()
})

test('is.tuple(is(-1,0,1), is.string)', () => {

    const isSort = is.tuple(is(-1,0,1), is.string)
    expectTypeOf(isSort)
        .toEqualTypeOf<Is<Tuple<[Or<[Value<-1>, Value<0>, Value<1>]>, String]>>>()

    expect(isSort([0, 'star'])).toBe(true)
    expect(isSort([1, 'star'])).toBe(true)
    expect(isSort([-1, 'star'])).toBe(true)
    expect(isSort([2, 'star'])).toBe(false)
    expect(isSort([0, true])).toBe(false)

    const valid = isSort.validate([0, 'star'])
    expectTypeOf(valid).toEqualTypeOf<[-1 | 0 | 1, string]>()
})

test('is.tuple(is.string, is.string).readonly', () => {

    const isName = is.tuple(is.string, is.string).readonly
    expectTypeOf(isName)
        .toEqualTypeOf<Is<ReadOnly<Tuple<[String,String]>>>>()

    expect(isName(['Ben', 'Zed'])).toBe(true)
    expect(isName(['Jerry'])).toBe(false)
    expect(isName([0,0])).toBe(false)

    const valid = isName.validate(['Ben', 'Zed'])
    expectTypeOf(valid)
        .toEqualTypeOf<readonly [string, string]>()
})

test('is.tuple(is.number, is.array.of.string).optional', () => {

    const isNumberThenArrayOfString = is.tuple(is.number, is.array.of.string).optional

    expect(isNumberThenArrayOfString([0,['']])).toBe(true)
    expect(isNumberThenArrayOfString([['']])).toBe(false)
    expect(isNumberThenArrayOfString([1, [1]])).toBe(false)

    const valid = isNumberThenArrayOfString.validate([0, ['']])
    expectTypeOf(valid)
        .toEqualTypeOf<[number, string[]] | nil>()
})

//// Or TO ////

const isBooleanOr = To.or(isBoolean)
const isBooleanOrString = isBooleanOr.string
const isBooleanOrStringOrNumber = To.or(isBoolean)(isString, isNumber)

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

it('chain method also has To.or signature', () => {

    const isSortOutput = To.or(new Value(0))(new Value(1), new Value(-1))

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
    const isStringOrNaN = To.or(isNaN).string
    expectTypeOf(isStringOrNaN).toMatchTypeOf<Is<Or<[NaN, String]>>>()
})