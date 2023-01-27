import { isString, safeJsonStringify } from '@benzed/util'
import { pluck } from '@benzed/array'

import { AnyValidate, ValidateInput, ValidateOutput } from './validator'
import { ValidationError } from './validator/validate-error'

import { expect, describe, it } from '@jest/globals'

/* eslint-disable @typescript-eslint/no-explicit-any */

//// Types ////

type ValidationTest<V extends AnyValidate> =
    ({ 
        input: ValidateInput<V>
        transform: boolean 
    } & ({ 
        output: ValidateOutput<V>
    } | { 
        error: string 
    }))

//// Helper ////
    
function runTests<V extends AnyValidate>(validator: V, ...tests: ValidationTest<V>[]): void {
    for (const test of tests ) {
        const isOutput = 'output' in test 

        const inputStr = safeJsonStringify(test.input)
        const outputStr = isOutput 
            ? `${safeJsonStringify(test.output)}`
            : `"${test.error}"`

        const description = isOutput && test.transform ? 'transforms' : 'asserts'

        const title = `${inputStr} ${isOutput ? 'results in' : 'throws'} ${outputStr}`

        describe(validator.name + ' ' + description, () => {
            it(title, () => {

                let validated: any
    
                try {
                    validated = validator(test.input, { transform: test.transform })
                } catch (e) {
                    validated = e
                }
    
                if (isOutput) 
                    expect(validated).toEqual(test.output)
                else 
                    expect(validated?.message).toContain(test.error)
            })
        })
    }
}

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

export const testValidator = <V extends AnyValidate>(
    validator: V, 
    ...tests: [description: string, ...tests: ValidationTest<V>[]] | ValidationTest<V>[]
): void => {

    const [ description ] = pluck(tests, isString)
    if (description) {
        describe(description, () => {
            runTests(validator, ...tests as ValidationTest<V>[])
        })
    }

}

