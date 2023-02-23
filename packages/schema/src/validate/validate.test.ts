import { describe } from '@jest/globals'

import { Validate } from './validate'
 
import ValidationContext from './validation-context'
import ValidationError from './validation-error'

import { testValidator } from './util.test'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Setup ////

const $numeric: Validate<string, `${number}`> = (i, options) => {
    
    const context = new ValidationContext(i, options)
    
    const digits = parseFloat(i) 
    if (Number.isNaN(digits)) {
        throw new ValidationError(
            `${i} could not be converted to a number`, 
            context
        )
    }

    context.transformed = `${digits}`

    const output = context?.transform ? context.transformed : i
    if (output !== context.transformed) {
        throw new ValidationError(
            `${i} must be a numeric string.`, 
            context
        )
    }

    return output as `${number}`
}

//// Tests ////

describe('$numeric example validation tests', () => {
    testValidator(
        $numeric,
        { asserts: '0' },
        { asserts: '100' },
        { asserts: 'nun', error: true },
        { asserts: ' 150', error: true },
        { transforms: '75' },
        { transforms: ' 124', output: '124' },
        { transforms: '~15-', error: true },
        { transforms: '001', output: '1' },
        { transforms: '4.5', output: '4.5' },
        { transforms: '123.45', output: '123.45' },
        { transforms: '123.00', output: '123' },
        { transforms: '1,234.56', output: '1' }, 
        { asserts: '1,234.56', error: true }, 
        { asserts: '100', output: '100' },
        { asserts: 'nun', error: true },
        { asserts: ' 150', error: true },
    )
})