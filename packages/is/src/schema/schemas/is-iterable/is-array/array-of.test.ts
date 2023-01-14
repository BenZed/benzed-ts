import { IsBoolean, IsNumber, IsString, isString } from '../../is-type'
import { arrayOf } from './array-of'
import { expectTypeOf } from 'expect-type'
import { IsUnion } from '../../or'
import IsArray from './is-array'

//// Tests ////

it('creates an array schematic of a specific type', () => {
    for (const isArrayOfString of [arrayOf(isString), arrayOf.string]) {
        expect(isArrayOfString([])).toEqual(true)
        expect(isArrayOfString([''])).toEqual(true)
        expect(isArrayOfString([true])).toEqual(false)
        expect(isArrayOfString([0])).toEqual(false)
    }
})

it('chaining with or', () => {
    const isComplex = arrayOf(isString.or.boolean).or.number

    expectTypeOf(isComplex)
        .toMatchTypeOf<IsUnion<[IsArray<IsUnion<[IsString, IsBoolean]>>, IsNumber]>>()

    expect(isComplex([0])).toBe(false)
    expect(isComplex(0)).toBe(true)
    expect(isComplex('0')).toBe(false)
    expect(isComplex(true)).toBe(false)
    expect(isComplex([true])).toBe(true)
    expect(isComplex(['true'])).toBe(true)
})

