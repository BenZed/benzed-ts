import { Struct } from '@benzed/immutable'
import { isNumber, isString, nil } from '@benzed/util'
import { it, describe } from '@jest/globals'

import { MainValidator, Schema, _SchemaSetters } from './schema'
import { SubValidator } from './sub-validator'
import { TypeValidator } from '../type-validator'

import { expectTypeOf } from 'expect-type'
import { testValidator, testValidationContract } from '../../../util.test'
import { ValidateInput, ValidateOutput } from '../../../validate'

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
    }

    interface LeadingZeros extends SubValidator<bignumber>, Struct { 
    
        // hypothetical validation configuration:
        // big number must have at least this many leading zeros.
        // Will transform. 
        readonly count: number 
    }

    interface Positive extends SubValidator<bignumber> {

        // Custom configuration signature
        configure(enabled?: boolean): { enabled: boolean }

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

    const number = new class NumberValidator extends TypeValidator<number> {

        isValid(input: unknown): input is number {
            return isNumber(input) && (isFinite(input) || !this.finite)
        }

        error(): string {
            return `Must be a ${this.finite ? 'finite ' : ''}number`
        }

        readonly finite: boolean = false

    }

    describe('main validator only', () => {

        const $number = new Schema(number)

        console.log($number)

        type _NumberSetters = keyof _SchemaSetters<typeof $number, {}>

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
            $number.error(() => 'Numbers only'),
            { transforms: nil, error: 'Numbers only' }
        )

    })

})