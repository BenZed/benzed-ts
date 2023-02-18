import { Falsy, isBigInt, isBoolean, isFalsy, isNumber, isPrimitive, isString, isSymbol, isTruthy, Primitive, Truthy } from './primitive'

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
        expectTypeOf<Primitive>().toEqualTypeOf<string | number | boolean | bigint | null | symbol | undefined>()
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
  
describe('isString', () => {
    it('should return true for string inputs', () => {
        expect(isString('hello')).toBe(true)
        expect(isString('world')).toBe(true)
        expect(isString('')).toBe(true)
    })
  
    it('should return false for non-string inputs', () => {
        expect(isString(123)).toBe(false)
        expect(isString(true)).toBe(false)
        expect(isString(undefined)).toBe(false)
        expect(isString(null)).toBe(false)
        expect(isString({})).toBe(false)
    })
})
  
describe('isNumber', () => {
    it('should return true for number inputs', () => {
        expect(isNumber(123)).toBe(true)
        expect(isNumber(0)).toBe(true)
        expect(isNumber(-3.14)).toBe(true)
    })
  
    it('should return false for non-number inputs', () => {
        expect(isNumber('123')).toBe(false)
        expect(isNumber(true)).toBe(false)
        expect(isNumber(undefined)).toBe(false)
        expect(isNumber(null)).toBe(false)
        expect(isNumber({})).toBe(false)
    })
  
    it('should return false for NaN', () => {
        expect(isNumber(NaN)).toBe(false)
    })
})
  
describe('isBoolean', () => {
    it('should return true for boolean inputs', () => {
        expect(isBoolean(true)).toBe(true)
        expect(isBoolean(false)).toBe(true)
    })
  
    it('should return false for non-boolean inputs', () => {
        expect(isBoolean(123)).toBe(false)
        expect(isBoolean('true')).toBe(false)
        expect(isBoolean(undefined)).toBe(false)
        expect(isBoolean(null)).toBe(false)
        expect(isBoolean({})).toBe(false)
    })
})
  
describe('isBigInt', () => {
    it('should return true for bigint inputs', () => {
        expect(isBigInt(BigInt(123))).toBe(true)
        expect(isBigInt(BigInt('12345678901234567890'))).toBe(true)
    })
  
    it('should return false for non-bigint inputs', () => {
        expect(isBigInt(123)).toBe(false)
        expect(isBigInt('123')).toBe(false)
        expect(isBigInt(undefined)).toBe(false)
        expect(isBigInt(null)).toBe(false)
        expect(isBigInt({})).toBe(false)
    })
})
  
describe('isPrimitive', () => {
    it('should return true for primitive inputs', () => {
        expect(isPrimitive(true)).toBe(true)
        expect(isPrimitive(123)).toBe(true)
        expect(isPrimitive('hello')).toBe(true)
        expect(isPrimitive(null)).toBe(true)
        expect(isPrimitive(undefined)).toBe(true)
        expect(isPrimitive(BigInt(123))).toBe(true)
        expect(isPrimitive(Symbol())).toBe(true)
    })
  
    it('should return false for non-primitive inputs', () => {
        expect(isPrimitive({})).toBe(false)
        expect(isPrimitive([])).toBe(false)
        expect(isPrimitive(() => { /**/ })).toBe(false)
    })
})