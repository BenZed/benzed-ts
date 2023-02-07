import { assign, isNumber, isString, nil, pick } from '@benzed/util'

import { it, describe } from '@jest/globals'

import { 
    MainValidator,
    SubValidator,
    Schema
} from './schema'

import { expectTypeOf } from 'expect-type'

import {
    testValidator,
    testValidationContract
} from '../../../util.test'

import { $$settings } from '../../validate-struct'

import { TypeValidator } from '../type-validator'

import { ContractValidator } from '../../contract-validator'
import { ValidationErrorMessage } from '../../../validation-error'

//// EsLint ////

/* eslint-disable  
    @typescript-eslint/ban-types
*/

//// Tests ////

describe('Schema Setters Type Tests', () => {

    // Hypothetical big number data type.
    type bignumber = `${number}`

    interface BigDecimal extends MainValidator<string, bignumber> { 
        
        // hypothetical optional transformation configuration;
        // if transforms are enabled, it'll try to parse invalid strings.
        readonly parse: boolean 

        [$$settings]: { parse: boolean }
    }

    interface LeadingZeros extends SubValidator<bignumber> { 
    
        // hypothetical validation configuration:
        // big number must have at least this many leading zeros.
        // Will transform. 
        readonly count: number 

        [$$settings]: { count: number, enabled: boolean }
    }

    interface Positive extends SubValidator<bignumber> {

        // Custom configuration signature
        configure(enabled?: boolean): { enabled: boolean}
    }

    /* eslint-disable @typescript-eslint/indent */
    type BigDecimalSchema =

        Schema<BigDecimal,
            {
                leadingZeros: LeadingZeros
                positive: Positive
            }
        >

    type ParseSetter = BigDecimalSchema['parse']
    type LeadingZerosSetter = BigDecimalSchema['leadingZeros']
    type PositiveSetter = BigDecimalSchema['positive']

    /* eslint-enable @typescript-eslint/indent */

    it('creates setter methods for main validator state properties', () => {
        expectTypeOf<ParseSetter>()
            .toEqualTypeOf<(i: boolean) => BigDecimalSchema>()
    })

    it('creates setter methods for sub validators', () => {
        expectTypeOf<LeadingZerosSetter>()
            .toEqualTypeOf<(state: Partial<{
            count: number
            enabled: boolean
        }>) => BigDecimalSchema>()
    })

    it('setter methods for sub validators use configure parameters, if provided', () => {
        expectTypeOf<PositiveSetter>()
            .toEqualTypeOf<(enabled?: boolean) => BigDecimalSchema>()
    })

})

describe('Schema implementation', () => {

    type NumberState = {
        message: ValidationErrorMessage<number>
        cast: TypeValidator<number>['cast']
        default: TypeValidator<number>['default']
        finite: boolean
    }

    const number = new class NumberValidator extends TypeValidator<number> {

        get [$$settings](): NumberState {
            return {
                message: this.message,
                cast: this.cast,
                default: this.default,
                finite: this.finite
            }
        }

        set [$$settings](state: NumberState) {
            assign(this, state)
        }

        isValid(input: unknown): input is number {
            return isNumber(input) && (isFinite(input) || !this.finite)
        }

        message(): string {
            return `Must be a ${this.finite ? 'finite ' : ''}number`
        }

        readonly finite: boolean = false
    }

    describe('main validator only', () => {

        const $number = new Schema(number)

        testValidationContract<unknown, number>($number, {
            invalidInput: NaN,
            validInput: 10
        })

        testValidator<unknown,number>(
            $number,
            { asserts: Infinity },
            { transforms: '100', error: 'Must be a number' },
            { transforms: nil, error: 'Must be a number' }
        )

        testValidator(
            $number.finite(true),
            { asserts: Infinity, error: 'Must be a finite number' }
        )

        testValidator<unknown, number>(
            $number.cast(i => isString(i) ? parseFloat(i) : i),
            { transforms: '100', output: 100 }
        ) 

        testValidator<unknown,number>(
            $number.default(() => 0),
            { transforms: nil, output: 0 }
        )

        testValidator<unknown,number>(
            $number.message(() => 'Numbers only'),
            { transforms: nil, error: 'Numbers only' }
        )

    })

    describe('with subvalidator', () => {

        class StringValidator extends TypeValidator<string> {
            isValid(input: unknown): input is string {
                return typeof input === 'string'
            }
        }

        class Capitalize extends ContractValidator<string, string> { 

            get name(): string {
                return this.constructor.name
            }

            enabled = false

            transform(input: string): string {
                return input.charAt(0).toUpperCase() + input.slice(1)
            }

            message(): string {
                return 'Must be capitalized.'
            }

            get [$$settings](): { enabled: boolean } {
                return pick(this, 'enabled')
            }

            configure(enabled = true): { enabled: boolean } {
                return { enabled }
            }
        }

        const $string = new Schema(new StringValidator(), {
            captialize: new Capitalize()
        })

        testValidator<unknown,string>(
            $string.captialize(),
            { transforms: 'ace', output: 'Ace' },
            { asserts: 'ace', error: 'Must be capitalized' },
            { transforms: 0, error: 'Must be a String' },
        )
    })
})