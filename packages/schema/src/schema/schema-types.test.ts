import { isNumber, isString } from '@benzed/util'

import { Schema } from './schema'

import { test, describe } from '@jest/globals'

import { expectTypeOf } from 'expect-type'
import { ValidationErrorInput, Validator } from '../validator'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/ban-types
*/
 
//// Tests ////  

describe('construction signatures', () => {
    
    test('basic validator settings', () => {
    
        const $string = new Schema({
            isValid: isString
        })

        expectTypeOf($string).toMatchTypeOf<Schema<unknown, string, {}>>()

    })

    it('error settings', () => {

        const $truthy = new Schema({
            isValid(input: unknown) {
                return !!input
            },
            error: 'Is not truthy.' 
        })
        expectTypeOf($truthy)
        //   uses validator settings error definition instead of just "string"
            .toEqualTypeOf<Schema<unknown, unknown, { error: ValidationErrorInput<unknown> }>>()
    })

    it('extension settings', () => {

        const $shape = new Schema({
            sides: 0,
            isValid(input: { sides: number }): boolean {
                return input.sides === this.sides
            },
            error() {
                return `Must have ${this.sides} sides.`
            }
        })

        // uses validator settings error definition instead of just "string"
        expectTypeOf($shape).toEqualTypeOf<Schema<
        /**/ { sides: number}, 
        /**/ { sides: number }, 
        /**/ { error: ValidationErrorInput<unknown>, sides: number }>
        >()
    })

    it('from basic validator', () => {

        const $string = new Validator({
            isValid(input: unknown): input is string {
                return typeof input === 'string'
            }
        })

        const $stringSchema = new Schema($string)
        expectTypeOf($stringSchema).toEqualTypeOf<Schema<unknown, string, {
            name: string
            error: ValidationErrorInput<unknown>
        }>>()
    })

    it('from extended validator', () => {

        const $isZero = new Validator({

            value: 0,

            isValid(input: number): boolean {
                return input === this.value
            }
        })

        const $isZeroSchema = new Schema($isZero)
        expectTypeOf($isZeroSchema).toEqualTypeOf<
        Schema<number, number, {
            error: ValidationErrorInput<number>
            name: string
            value: number
        }>
        >()
    })

    it('with nested validator', () => {

        const $lower = new Validator({
            name: 'lowercase',
            transform(i: string) {
                return i.toLowerCase()
            },
            error: 'Must be lowercase.'
        })

        const $string = new Schema({
            name: 'string',
            isValid: isString,
            lowercase: $lower
        })

        type StringSchema = Schema<unknown, string, {
            name: string
            lowercase: Validator<string, string>
        }>
        expectTypeOf($string).toEqualTypeOf<StringSchema>()
    
        expectTypeOf($string.settings).toEqualTypeOf<{
            name: string
            lowercase: {
                error: ValidationErrorInput<string> 
                name: string
            } | undefined
        }>()

    })

})

describe('setters', () => {

    const $round = new Validator({
        name: 'round',
        transform(input: number) {
            return Math.round(input)
        }
    })

    const $range = new Schema({
        name: 'range',
        error() {
            const max = isFinite(this.max) 
            const min = isFinite(this.min)
            const inc = this.inclusive 
    
            const detail = min && max 
                ? `between ${this.min} and ${inc ? 'equal to ' : ''}${this.max}`
                : min 
                    ? `equal or above ${this.min}`
                    : `${inc ? 'equal to or ' : ''}below ${this.max}`
    
            return `Must be ${detail}`
        },
        isValid(input: number) {
            return input >= this.min && (
                this.inclusive 
                    ? input <= this.max
                    : input < this.max
            )
        },
        inclusive: false,
        min: -Infinity,
        max: Infinity,
        round: $round
    })  

    const $number = new Schema({
        name: 'number',
        isValid: isNumber,
        error() {
            return `Must be a ${this.name}`
        },
        transform(input: unknown) {
            if (!this.isValid(input))
                return this.cast(input)
            return input
        },
        cast(input: unknown) {
            if (typeof input === 'string')
                return parseFloat(input)
            return input
        },
        range: $range
    })

    it('creates set methods for validator settings', () => {
        expectTypeOf($number.error)
            .toEqualTypeOf<(error: ValidationErrorInput<unknown>) => typeof $number>()
    })

    it('named instead of name', () => {
        expectTypeOf($number.named)
            .toEqualTypeOf<(name: string) => 
            typeof $number
        >()
    })

    it('creates set methods for extra settings', () => {
        expectTypeOf($number.cast)
            .toEqualTypeOf<(cast: (input: unknown) => unknown) => 
            typeof $number
        >()
    })

    it('creates methods for configuring sub valiators', () => {

        expectTypeOf($number.range).toEqualTypeOf<
        (
            range?: boolean | 
            string | 
            Partial<{ 
                min: number
                max: number
                inclusive: boolean
                name: string
                error: ValidationErrorInput<number>
                round: string | boolean | {
                    name: string
                    error: ValidationErrorInput<number>
                } | undefined
            }> |
            ((update: typeof $range) => typeof $range)
        ) => 
                typeof $number
        >()

    })

})