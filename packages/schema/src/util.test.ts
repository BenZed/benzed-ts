import { safeJsonStringify } from '@benzed/util'
import { Validate } from './validator'
import { ValidationError } from './validator/validate-error'

import { expect, describe, it } from '@jest/globals'

/* eslint-disable @typescript-eslint/no-explicit-any */

//// Exports ////

export function expectValidationError(func: () => unknown): ReturnType<typeof expect> {

    let error: unknown
    try {
        func()
    } catch (e) {
        error = e
    }

    expect(error).toHaveProperty('name', ValidationError.name)
    expect(error).toHaveProperty('path')

    return expect(error)
}

export const testValidator = <I,O>(
    validator: Validate<I,O>, 
    ...data: ({ input: I, transform: boolean } & ({ output: O } | { error: string }))[]
): void => {

    for (const datum of data) {
        const isOutput = 'output' in datum 

        const inputStr = safeJsonStringify(datum.input)
        const outputStr = isOutput 
            ? `${safeJsonStringify(datum.output)}`
            : `"${datum.error}"`

        const description = isOutput && datum.transform ? 'transforms' : 'asserts'

        const title = `${inputStr} ${isOutput ? 'results in' : 'throws'} ${outputStr}`

        describe(validator.name + ' ' + description, () => {
            it(title, () => {

                let validated: any
    
                try {
                    validated = validator(datum.input, { transform: datum.transform })
                } catch (e) {
                    validated = e
                }
    
                if (isOutput) 
                    expect(validated).toEqual(datum.output)
                else 
                    expect(validated?.message).toContain(datum.error)
            })
        })
    }
}
