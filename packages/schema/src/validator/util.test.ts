import { safeJsonStringify } from '@benzed/util'
import Validate from './validate'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Exports ////

export const testValidator = <I,O>(
    validator: Validate<I,O>, 
    data: { input: I, transform: boolean } & ({ output: O } | { error: string }),
): void => {

    const isOutput = 'output' in data 

    const inputStr = safeJsonStringify(data.input)
    const outputStr = isOutput 
        ? `${safeJsonStringify(data.output)}`
        : `"${data.error}"`

    const description = isOutput && data.transform ? 'transforms' : 'asserts'

    const title = `${inputStr} ${isOutput ? 'results in' : 'throws'} ${outputStr}`

    describe(description, () => {
        it(title, () => {

            let validated: any
    
            try {
                validated = validator(data.input, { transform: data.transform })
            } catch (e) {
                validated = e
            }
    
            if (isOutput) 
                expect(validated).toEqual(data.output)
            else 
                expect(validated?.message).toContain(data.error)
        })
    })
}
