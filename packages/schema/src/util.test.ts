import { isPrimitive, isString, nil } from '@benzed/util'
import { pluck } from '@benzed/array'

import { AnyValidate, ValidateInput, ValidateOutput } from './validator'
import { ValidationError } from './validator/validate-error'

import { expect, describe, it } from '@jest/globals'

/* eslint-disable @typescript-eslint/no-explicit-any */

//// Types ////

type ValidationTest<V extends AnyValidate> =
    ({ 
        input: ValidateInput<V>
        transform?: boolean 
    } & ({ 
        output: ValidateOutput<V>
    } | {
        outputSameAsInput: true
    } | { 
        error: string 
    }))

//// Helper ////

const print = (input: unknown):string => isPrimitive(input) 
    ? String(input) 
    : JSON.stringify(input)

function runTests<V extends AnyValidate>(validator: V, ...tests: ValidationTest<V>[]): void {
    for (const test of tests ) {
        const isOutput = !('error' in test) 

        const inputStr = print(test.input)

        const output = 'outputSameAsInput' in test 
            ? test.input
            : 'output' in test 
                ? test.output
                : nil

        const outputStr = isOutput 
            ? `${print(output)}`
            : `"${test.error}"`   

        const { transform = true } = test

        const title = validator.name + 
            ` ${transform ? 'transform' : 'assert'}` + 
            ` ${inputStr} ${isOutput ? '->' : 'throws'} ${outputStr}`

        it(title, () => {

            let validated: any
        
            try {
                validated = validator(test.input, { transform })
            } catch (e) {
                validated = e
            }
        
            if (isOutput) 
                expect(validated).toEqual('output' in test ? test.output : test.input)
            else 
                expect(validated?.message).toContain(test.error)
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
    } else 
        runTests(validator, ...tests as ValidationTest<V>[])
}

