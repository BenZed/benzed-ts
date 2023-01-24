
import { ValidateOptions } from './validate'

import { testValidator } from '../util.test'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Setup ////

const numericString = (i: string, options?: Partial<ValidateOptions>): `${number}` => {

    const digits = parseFloat(i)
    if (Number.isNaN(digits))
        throw new Error(`${i} could not be converted to a number`)

    const transformed = `${digits}`

    const output = options?.transform ? transformed : i
    if (output !== transformed)
        throw new Error(`${i} must be a numeric string.`)
 
    return output as `${number}`
}

//// Tests ////

testValidator(numericString, { input: '100', output: '100', transform: true })
testValidator(numericString, { input: '100', output: '100', transform: false })
testValidator(numericString, { input: '100.1', output: '100.1', transform: true }) 
testValidator(numericString, { input: '100.1', output: '100.1', transform: false }) 
testValidator(numericString, { input: ' 1 ', output: '1', transform: true })
testValidator(numericString, { input: ' 1 ', error: 'must be a numeric string', transform: false })
testValidator(numericString, { input: 'Sup', error: 'could not be converted to a number', transform: false })
