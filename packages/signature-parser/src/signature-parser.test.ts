import { isEqual, isNumber, isOptional, isString, nil } from '@benzed/util'

import { test, describe, expect } from '@jest/globals'

import SignatureParser from './signature-parser'
import { expectTypeOf } from 'expect-type'

//// Tests ////

describe('basic example', () => {

    const toValueErrorNoLayout = new SignatureParser({
        value: isNumber,
        error: isOptional(isString)
    })
    
    //// Tests ////

    test('no layout', () => {

        type ValueErrorSignature = Parameters<typeof toValueErrorNoLayout>
        type ValueError = ReturnType<typeof toValueErrorNoLayout>

        expectTypeOf<ValueError>().toEqualTypeOf<{
            value: number
            error?: string
        }>()

        expectTypeOf<ValueErrorSignature>().toEqualTypeOf<[{
            value: number
            error?: string
        }]>()

        expect(toValueErrorNoLayout({ value: 0 })).toEqual({ value: 0 })
    })

    test('layout', () => {

        const toValueError = toValueErrorNoLayout
            .addLayout('value', 'error')

        type ValueErrorSignature = Parameters<typeof toValueError>

        expectTypeOf<ValueErrorSignature>().toEqualTypeOf<
        [number, string?] |
        [{ 
            value: number
            error?: string
        }]
        >() 

        expect(toValueError(10)).toEqual({ value: 10 })
        expect(toValueError(10, nil)).toEqual({ value: 10 })
        expect(toValueError(10, 'Error')).toEqual({ value: 10, error: 'Error' })
    })

    test('multiple layouts', () => {

        const toRangeSettings = new SignatureParser({
            min: isNumber,
            max: isNumber,
            comparator: isOptional(isEqual('>', '>=', '<', '<=')),
            error: isOptional(isString)
        })
            .addLayout('min', 'comparator', 'max', 'error')
            .addLayout('min', 'max', 'error')

        expect(toRangeSettings(0, 10)).toEqual({ min: 0, max: 10 })
        expect(toRangeSettings(0, 10, 'Invalid')).toEqual({ min: 0, max: 10, error: 'Invalid' })
        expect(toRangeSettings(0, '>', 10, 'Invalid')).toEqual({ min: 0, max: 10, error: 'Invalid', comparator: '>' })
    })

    test('defaults', () => {

        const toCompareSettings = new SignatureParser({
            value: isNumber,
            comparator: isEqual('>', '>=', '<', '<='),
            error: isOptional(isString)
        })
            .setDefaults({ error: 'Not in range.'})
            .addLayout('comparator', 'value', 'error')

        const output = toCompareSettings('>', 0)

        expectTypeOf(output).toEqualTypeOf<{
            comparator: string
            value: number
            error: string
        }>()

        expect(toCompareSettings('>', 0))
            .toEqual({ comparator: '>', value: 0, error: 'Not in range.'})
    })

    test('object is optional if every field is', () => {
        const toVector = new SignatureParser({
            x: isOptional(isNumber),
            y: isOptional(isNumber)
        }, {
            x: 0,
            y: 0
        }).addLayout('x', 'y')

        expect(toVector()).toEqual({ x: 0, y: 0 })
    })

})

test('merge', () => {

    const toFoo = new SignatureParser({
        foo: isString
    }).addLayout('foo')

    const toBar = new SignatureParser({
        bar: isNumber
    }).addLayout('bar')

    const toFooBar = SignatureParser.merge(toFoo, toBar)

    type ToFooBarParams = Parameters<typeof toFooBar>
    expectTypeOf<ToFooBarParams>().toEqualTypeOf<[string] | [{
        foo: string
    }] | [number] | [{
        bar: number
    }]>()

    type ToFooBarResult = ReturnType<typeof toFooBar>
    expectTypeOf<ToFooBarResult>().toEqualTypeOf<{
        foo: string
    } | {
        bar: number
    }>()

    expect(toFooBar('ace')).toEqual({ foo: 'ace' })
    expect(toFooBar(10)).toEqual({ bar: 10 }) 
}) 