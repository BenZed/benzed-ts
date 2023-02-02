import { MainValidator, PipeSchema, Schema } from './schema'

import { it, describe } from '@jest/globals'

import { Struct } from '@benzed/immutable'
import { SubValidator } from './sub-validator'

import { expectTypeOf } from 'expect-type'
import { ValidatorStruct } from '../../validator-struct'

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

describe('pipe schema setters', () => {

    it('creates option setters for every validator in the pipe', () => {
        type String = ValidatorStruct<unknown, string> & { cast: boolean}
        type Path = ValidatorStruct<string, `/${string}`> & { protocol: string }

        type StringToPath = PipeSchema<[String, Path]>

        expectTypeOf<StringToPath['cast']>().toEqualTypeOf<(cast: boolean) => PipeSchema<[String, Path]>>()
    })

})