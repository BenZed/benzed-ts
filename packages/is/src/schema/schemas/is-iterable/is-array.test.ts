import { IsBoolean, IsNumber, IsString, isString } from '../is-type'
import { isArray, IsArrayOf } from './is-array'
import { expectTypeOf } from 'expect-type'
import { IsUnion } from '../or'

//// Tests ////

it('returns true if something is an array', () => {
    expect(isArray([])).toBe(true)
    expect(isArray({})).toBe(false)
})

it('returns false if something is not an array', () => {
    expect(isArray(null)).toBe(false)
    expect(isArray.is(4)).toBe(false)
})

it('validates arrays', () => {
    expect(isArray.validate([''])).toEqual([''])  
    expect(isArray.validate([1,2,3,4])).toEqual([1,2,3,4])
    expect(() => isArray.validate(1)).toThrow('Must be type array')
})

it('asserts arrays', () => {
    expect(() => isArray.assert([])).not.toThrow()
    expect(() => isArray.assert({})).toThrow('Must be type array')
})

describe('of', () => {

    it('creates an array schematic of a specific type', () => {
        for (const isArrayOfString of [isArray.of(isString), isArray.of.string]) {
            expect(isArrayOfString([])).toEqual(true)
            expect(isArrayOfString([''])).toEqual(true)
            expect(isArrayOfString([true])).toEqual(false)
            expect(isArrayOfString([0])).toEqual(false)
        }
    })

    it('validators are preserved when chaining an "of" clause', () => {

        const isNonEmptyArray = isArray
            .asserts(
                array => array.length > 0, 
                'must not be empty',
                'notEmpty'
            )

        expect(() => isNonEmptyArray.validate([])).toThrow('must not be empty')
        expect(isNonEmptyArray.is([])).toBe(false)
        expect(isNonEmptyArray([])).toBe(false)
        expect(isNonEmptyArray.is([true])).toBe(true)
        expect(isNonEmptyArray([true])).toBe(true)

        for (const isNonEmptyArrayOfString of [isNonEmptyArray.of.string, isNonEmptyArray.of(isString)]) {
            expect(isNonEmptyArrayOfString([])).toBe(false)
            expect(isNonEmptyArrayOfString([true])).toBe(false)
            expect(isNonEmptyArrayOfString(['hello'])).toBe(true)
        }
    })

    it('chaining with or', () => {
        const isComplex = isArray.of(isString.or.boolean).or.number

        expectTypeOf(isComplex).toEqualTypeOf<
        IsUnion<[IsArrayOf<IsUnion<[IsString, IsBoolean]>>, IsNumber]>
        >()

        expect(isComplex([0])).toBe(false)
        expect(isComplex(0)).toBe(true)
        expect(isComplex('0')).toBe(false)
        expect(isComplex(true)).toBe(false)
        expect(isComplex([true])).toBe(true)
        expect(isComplex(['true'])).toBe(true)
    })

})
