import { MainValidator, Schema } from './schema'

import { it, describe } from '@jest/globals'

import { Struct } from '@benzed/immutable'
import { SubValidator } from './sub-validator'

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

    /* eslint-enable @typescript-eslint/indent */

    it('sets schemas', () => {
        
        const $bigDecimal = null as unknown as BigDecimalSchema

        $bigDecimal.leadingZeros({ count: 10 })
        $bigDecimal.positive()
        $bigDecimal.parse(true)

        $bigDecimal
            .leadingZeros({ count: 10 })
            .positive()

    })

})
