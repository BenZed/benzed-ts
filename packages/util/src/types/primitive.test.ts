import { Falsy, isBigInt, isBoolean, isFalsy, isInteger, isNumber, isPrimitive, isString, isSymbol, isTruthy, Primitive, Truthy } from './primitive'

import { expectTypeOf } from 'expect-type'

const value: unknown = {}

describe('falsy', () => {

    it('Falsy is a union of all falsy values', () => {
        expectTypeOf<Falsy>().toEqualTypeOf<false | 0 | '' | null | undefined>()
    })

    it('isFalsy()', () => {
        if (isFalsy(value))
            expectTypeOf(value).toEqualTypeOf<Falsy>()
    })

})

describe('Truthy', () => {

    it('Truthy is a union of truthy values', () => {
        expectTypeOf<Truthy>().toEqualTypeOf<string | number | object | true>()
    })

    it('isTruthy()', () => {
        if (isTruthy(value))
            expectTypeOf(value).toEqualTypeOf<Truthy>()
    })

})

describe('Primitive', () => {

    it('union of all primitive values', () => {
        expectTypeOf<Primitive>().toEqualTypeOf<string | number | boolean | bigint | null | undefined>()
    })

    it('isPrimitive', () => {
        for (const primitive of [null, undefined, 'string', 1000, true])
            expect(isPrimitive(primitive)).toEqual(true)
    })

})

it('isString()', () => {
    expect(isString('string')).toBe(true)
    if (isString(value))
        expectTypeOf(value).toEqualTypeOf<string>()
})

it('isNumber()', () => {
    expect(isNumber(100)).toBe(true)
    if (isNumber(value))
        expectTypeOf(value).toEqualTypeOf<number>()
})

it('isBoolean()', () => {
    expect(isBoolean(true)).toBe(true)
    if (isBoolean(value))
        expectTypeOf(value).toEqualTypeOf<boolean>()
})

it('isBigInt()', () => {
    expect(isBigInt(10n)).toBe(true)
    if (isBigInt(value))
        expectTypeOf(value).toEqualTypeOf<bigint>()
})

it('isSymbol()', () => {
    expect(isSymbol(Symbol())).toBe(true)
    if (isSymbol(value))
        expectTypeOf(value).toEqualTypeOf<symbol>()
})

it('isInteger', () => {
    if (isInteger(value))
        expectTypeOf(value).toEqualTypeOf<number>()
})
