import { ansi, isPrimitive } from '@benzed/util'
import { lines } from '@benzed/string'

import { it } from '@jest/globals'

import { runValidatorTest, ValidationTest, ValidationTestResult, Validator } from '@benzed/schema'
 
//// Helper ////

// Pretty-print method for making the title readable
const print = (input: unknown):string => isPrimitive(input) 
    ? String(input) 
    : JSON.stringify(input)

//// FailedValidationTestError ////

class FailedValidationTestError extends Error {
    constructor(
        reason: string,
        readonly result: Pick<ValidationTestResult<unknown,unknown>, 'error' | 'output'>
    ) {

        super(lines(

            ansi('Validation test failed', 'red'),

            'reason: ' + ansi(reason, 'yellow'),

            'error' in result
                ? 'validation error: ' + ansi(result.error ?? '', 'yellow')
                : '',

            'output' in result 
                ? 'validation output: ' + print(result.output)
                : ''
        ))
    }
}

//// Implementations ////

/**
 * Test that a validator provides an expected result with the given input and options.
 */
export function testValidator<I,O >(
    validate: Validator<I,O>,
    ...tests: (ValidationTest<I,O> & { title?: string, only?: boolean, skip?: boolean })[]
): void {

    for (const test of tests) {

        // prepare test
        const applyTransforms = 'transforms' in test 
        const expectingError = 'error' in test
        const expectOutputDifferentFromInput = 'output' in test && applyTransforms

        const input = applyTransforms ? test.transforms : test.asserts

        const testTitle = test.title ??
        `${applyTransforms ? 'validates' : 'asserts'} ${print(input)}` + 
            (expectingError  
                ? ' is invalid' + (test.error === true ? '' : ` "${test.error}"`)
                : expectOutputDifferentFromInput 
                    ? ` to ${print(test.output)}`
                    : ' is valid'
            )

        // run test
        const method = test.skip ? it.skip : test.only ? it.only : it
        method(testTitle, () => {
            const { grade, output, error } = runValidatorTest(validate, test)
            if (!grade.pass) {
                throw new FailedValidationTestError(
                    grade.reason, 
                    { output, error }
                )
            }
        })
    }
}

