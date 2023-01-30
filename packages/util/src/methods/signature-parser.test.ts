import { isNumber, isOneOf, isOptional, isString, nil } from '../types'
import SignatureParser from './signature-parser'

import { expectTypeOf } from 'expect-type'

import { test, describe, expect } from '@jest/globals'

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

        expectTypeOf<ValueErrorSignature>().toEqualTypeOf<[[{
            value: number
            error?: string
        }]]>()

        expect(toValueErrorNoLayout([{ value: 0 }])).toEqual({ value: 0 })
    })

    describe('layout', () => {

        const toValueError = toValueErrorNoLayout
            .addLayout('value', 'error')

        type ValueErrorSignature = Parameters<typeof toValueError>
        expectTypeOf<ValueErrorSignature>().toEqualTypeOf<[
            [number, string?] |
            [{
                value: number
                error?: string
            }]
        ]>()

        expect(toValueError([10])).toEqual({ value: 10 })
        expect(toValueError([10, nil])).toEqual({ value: 10 })
        expect(toValueError([10, 'Error'])).toEqual({ value: 10, error: 'Error' })
    })

    describe('multiple layouts', () => {

        const toRangeSettings = new SignatureParser({
            min: isNumber,
            max: isNumber,
            comparator: isOptional(isOneOf('>', '>=', '<', '<=')),
            error: isOptional(isString)
        })
            .addLayout('min', 'comparator', 'max', 'error')
            .addLayout('min', 'max', 'error')

        expect(toRangeSettings([0, 10])).toEqual({ min: 0, max: 10 })
        expect(toRangeSettings([0, 10, 'Invalid'])).toEqual({ min: 0, max: 10, error: 'Invalid' })
        expect(toRangeSettings([0, '>', 10, 'Invalid'])).toEqual({ min: 0, max: 10, error: 'Invalid', comparator: '>' })
    })

    describe('defaults', () => {

        const toCompareSettings = new SignatureParser({
            value: isNumber,
            comparator: isOneOf('>', '>=', '<', '<='),
            error: isOptional(isString)
        })
            .setDefaults({ error: 'Not in range.'})
            .addLayout('comparator', 'value', 'error')

        const output = toCompareSettings(['>', 0])

        expectTypeOf(output).toEqualTypeOf<{
            comparator: string
            value: number
            error: string
        }>()

        expect(toCompareSettings(['>', 0]))
            .toEqual({ comparator: '>', value: 0, error: 'Not in range.'})
    })

    describe('object is optional if every field is', () => {
        const toVector = new SignatureParser({
            x: isOptional(isNumber),
            y: isOptional(isNumber)
        }, {
            x: 0,
            y: 0
        }).addLayout('x', 'y')

        expect(toVector([])).toEqual({ x: 0, y: 0 })
    })

})
