import { describe } from '@jest/globals'
 
import ValidationContext from './validation-context'

import { testValidator } from './util.test'
import { Validator } from './validator'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Setup //// 

class Numeric extends Validator<string, `${number}`> {

    [Validator.analyze](ctx: ValidationContext<string, `${number}`>) {
    
        const digits = parseFloat(ctx.input)
        if (Number.isNaN(digits)) 
            return ctx.setError('could not be converted to a number')
    
        ctx.transformed = `${digits}`
    
        const output = ctx.transform ? ctx.transformed : ctx.input
        return output !== ctx.transformed 
            ? ctx.setError('must be a numeric string')
            : ctx.setOutput(output as `${number}`)
    }

    get [Validator.state](): {} {
        return {}
    }
}

const $numeric = new Numeric

//// Tests ////

describe('$numeric example validation tests', () => { 
    testValidator<string, `${number}`>(
        // validator as first argument
        $numeric,

        // assertion tests; tests that perform no transformations, just check weather
        // the given value is valid or not
        { asserts: '0' },
        { asserts: '100' },
        { asserts: 'nun', error: true }, // <- error true if an error is expected
        { asserts: ' 150', error: true },
        { asserts: '1,234.56', error: true }, 
        { asserts: '100', output: '100' },
        { asserts: 'nun', error: true },
        { asserts: ' 150', error: true },

        // transform tests; tests that perform transformations, and throw
        // if those transformations do not result in a valid output
        { transforms: '75' },
        { transforms: ' 124', output: '124' },
        { transforms: '~15-', error: true },
        { transforms: '001', output: '1' },
        { transforms: '4.5', output: '4.5' },
        { transforms: '123.45', output: '123.45' },
        { transforms: '123.00', output: '123' },
        { transforms: '1,234.56', output: '1' }, 
    )
})
