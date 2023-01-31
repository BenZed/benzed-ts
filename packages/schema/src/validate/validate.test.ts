
import { Validate } from './validate'

import { testValidateContract } from '../util.test'
import ValidationError from './validation-error'
import ValidationContext from './validation-context'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/
 
//// Setup //// 

const $numeric: Validate<string, `${number}`> = (i, options) => {

    const context = new ValidationContext(i, options)

    const digits = parseFloat(i)
    if (Number.isNaN(digits))
        throw new Error(`${i} could not be converted to a number`)

    const transformed = `${digits}`
 
    const output = options?.transform ? transformed : i
    if (output !== transformed) {
        throw new ValidationError(
            `${i} must be a numeric string.`, 
            context
        )
    }
 
    return output as `${number}`
}

//// Tests ////

testValidateContract(
    $numeric, 
    {
        validInput: '100',
        invalidInput: 'not-a-number',
        transformableInput: ' 150',
        transformedOutput: '150'
    }
)