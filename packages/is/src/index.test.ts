import { nil } from '@benzed/util'
import { equals } from '@benzed/immutable'
import { Or, Not, Optional, ReadOnly, ValidateOutput } from '@benzed/schema'

import { test, describe, it, expect } from '@jest/globals'

import { is } from './index'

import { expectTypeOf } from 'expect-type'
import { String, Boolean, Shape, Number, InstanceOf } from './schemas'
import { Is } from './is'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types,
    @typescript-eslint/indent
*/

//// Setup ////

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

        expect(
            equals(
                is.string,
                is.string.optional.required
            )
        ).toBe(true)
    }) 

    test('type', () => {
        expectTypeOf(is.string.optional).toEqualTypeOf<Is<Optional<String>>>()
        expectTypeOf(is.string.optional.optional).toEqualTypeOf<Is<Optional<String>>>()
        expectTypeOf(is.string.optional.required).toEqualTypeOf<Is<String>>()
    })

})

it('is.integer.or.boolean', () => {

    expect(
        equals(
            is.integer.or.boolean,
            is(is.integer, is.boolean)
        )
    ).toBe(true)

})

it('is.optional.bigint', () => {
    expect(
        equals(is.optional.bigint, is.bigint.optional)
    ).toBe(true)
})

it('is.readonly.string', () => {
    expect(
        equals(is.readonly.string, is.string.readonly)
    ).toBe(true)
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

    test('writable', () => {
        expect(
            equals(
                is.string,
                is.string.readonly.writable
            )
        ).toBe(true)
    })
})

describe('is.not.string', () => {

    it('guards not strings', () => {

        expect(is.not.string(10)).toBe(true)
        if (is.not.string(value))
            expectTypeOf(value).toEqualTypeOf<unknown>()

        expectTypeOf(is.not.string).toEqualTypeOf<Is<Not<String>>>()
    })

    it('nests correctly', () => {

        const isNotStringOrBool = is.not(is.string, is.boolean)

        expect(isNotStringOrBool(0)).toEqual(true)
        expect(isNotStringOrBool('ace')).toBe(false)
        expect(isNotStringOrBool(true)).toBe(false)

        expectTypeOf(isNotStringOrBool).toEqualTypeOf<Is<Not<Or<[String, Boolean]>>>>()
    })

    it('chains', () => {
        expect(equals(
            is.not.string.or.boolean,
            is.not(is.string, is.boolean)
        )).toBe(true)
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

describe('is.shape', () => {

    const isVector = is.shape({
        x: is.number,
        y: is.number
    }).named('Vector')

    test('vector', () => {

        expect(isVector({ x: 5, y: 5 })).toBe(true)
        expectTypeOf(isVector.validate).toEqualTypeOf<
            Shape<{
                x: Number
                y: Number
            }>
        >()

        expectTypeOf<ValidateOutput<typeof isVector.validate>>()
            .toEqualTypeOf<{
                x: number 
                y: number 
            }>() 
    })

    test('property optional', () => {

        const isEdge = is.shape({
            a: isVector,
            b: isVector.optional
        }).named('Edge')
        expectTypeOf<ValidateOutput<typeof isEdge.validate>>()
            .toEqualTypeOf<{
                a: { x: number, y: number } 
                b?: { x: number, y: number } 
            }>() 

    })

    test('property readonly', () => {

        const isTodo = is.shape({
            title: is.string.readonly,
            description: is.string,
            completed: is.boolean
        })

        expectTypeOf<ValidateOutput<typeof isTodo.validate>>()
            .toEqualTypeOf<{
                readonly title: string
                description: string
                completed: boolean 
            }>()

    })

    test('shape readonly', () => {

        const $readonlyVector = isVector.readonly.validate

        expectTypeOf<ValidateOutput<typeof $readonlyVector>>()
        .toEqualTypeOf<{
            readonly x: number 
            readonly y: number 
        }>()

    })

    test('union shapes', () => {

        const isFooOrBar = 
            is.shape({
                foo: 'foo' as const
            })
            .or.shape({
                bar: 'bar' as const
            })

        expect(isFooOrBar({ foo: 'foo' })).toBe(true)
        expect(isFooOrBar({ bar: 'bar' })).toBe(true)
        expect(isFooOrBar({ })).toBe(false)

    })

    test('nested shapes', () => {

        const isWeird = is.shape({
            a: {
                b: {
                    c: 'ace' as const
                }
            }
        })

        expect(isWeird({ a: { b: { c: 'ace' } } } )).toBe(true)
    })

})

it('is.instance', () => {

    class Bomb {
        constructor(readonly time: number) {}
    }

    const isBomb = is.instanceOf(Bomb)

    expect(isBomb(new Bomb(5))).toBe(true)
    expectTypeOf<typeof isBomb>()
        .toEqualTypeOf<Is<InstanceOf<Bomb>>>()
})

it('is.null.or.nan.or.undefined', () => {

    const isNil = is.null.or.nan.or.undefined
    expect(isNil(null)).toBe(true)
    expect(isNil(undefined)).toBe(true)
    expect(isNil(NaN)).toBe(true)
})

it('is.array', () => {

    const isArray = is.array

    expect(isArray([])).toBe(true)
    expect(isArray('')).toBe(false)
})

it('is.arrayOf(is.number)', () => {
    const isArrayOfNumber = is.arrayOf(is.number)

    expect(isArrayOfNumber([0])).toBe(true)
    expect(isArrayOfNumber(['ace'])).toBe(false)
})

it('is.number.or.arrayOf(is.boolean)', () => {
    const isNumberOrArrayOfBoolean = is.number.or.arrayOf(is.boolean)
    expect(isNumberOrArrayOfBoolean(5)).toBe(true)
    expect(isNumberOrArrayOfBoolean([true])).toBe(true)
    expect(isNumberOrArrayOfBoolean(['ace'])).toBe(false)
})

it('is.tuple(is.number, is.number)', () => {

    const isRange = is.tuple(is.number, is.number).named('Range')

    expect(isRange([0,0])).toBe(true)
    expect(isRange([0])).toBe(false)
    expect(isRange(['ace', 'base'])).toBe(false)
})

it('is.recordOf(is.string, is.number)', () => {

    const isPhoneBook = is.recordOf(is.string, is.number)

    expect(isPhoneBook({ 'Jerry': 4506781238 })).toBe(true)
})

it('is.recordOf(is.number)', () => {

    const isNumericTable = is.recordOf(is.number)
    const $$two = Symbol('two')

    expect(
        isNumericTable({ 
            'one': 1, 
            [$$two]: 2 
        })
    ).toBe(true)
})

describe('is.shape methods', () => {

    it('is.shape.pick', () => {

        const isVector = is.shape({
            x: is.number,
            y: is.number
        })

        const isX = isVector.pick('x')
        expectTypeOf(isX).toMatchTypeOf<Is<Shape<{
            x: Number
        }>>>()

        expect(isX({ x: 0 })).toBe(true)
        expect(isX({ y: 10 })).toBe(false)
    })

})

it('is.string.assert', () => {
    expect(() => is.string.assert(0)).toThrow('must be String')
})