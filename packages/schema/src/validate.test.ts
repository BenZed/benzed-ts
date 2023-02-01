import { describe } from '@jest/globals'

import { Validate } from './validate'
 
import ValidationContext from './validation-context'
import ValidationError from './validation-error'

import {
    testValidationContract,
    testValidator
} from './util.test'

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

describe('$numeric example validator contract', () => { 
    testValidationContract( 
        $numeric,
        {
            validInput: '100',
            invalidInput: 'not-a-number',
            transformableInput: ' 150',
            transformedOutput: '150'
        }
    )
})

describe('$numeric example validation tests', () => {
    testValidator(
        $numeric,
        { asserts: '0' },
        { asserts: '100' },
        { asserts: 'nun', error: 'could not be converted to a number' },
        { asserts: ' 150', error: 'must be a numeric string' },
        { transforms: '75' },
        { transforms: ' 124', output: '124' },
        { transforms: '~15-', error: 'could not be converted to a number' },
    )
})
