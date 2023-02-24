import { isPrimitive } from '@benzed/util'
import { ansi } from '@benzed/logger'

import { it } from '@jest/globals'

import { runValidationTest, ValidationTest, ValidationTestResult } from './validation-test'
import { Validate } from './validate'

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

        const lines: string[] = [
            ansi('Validation test failed', 'red'),
            'reason: ' + ansi(reason, 'yellow'),
            'error' in result 
                ? 'validation error: ' + ansi(result.error?.message ?? '', 'yellow')
                : 'validation output: ' + print(result.output)
        ]

        super(lines.join('\n'))
    }
}

//// Implementations ////

/**
 * Test that a validator provides an expected result with the given input and options.
 */
export function testValidator<I,O extends I>(
    validate: Validate<I,O>,
    ...tests: ValidationTest<I,O>[]
): void {

    for (const test of tests) {

        // prepare test
        const applyTransforms = 'transforms' in test 
        const expectingError = 'error' in test
        const expectOutputDifferentFromInput = 'output' in test && applyTransforms

        const input = applyTransforms ? test.transforms : test.asserts

        const testTitle = 
            `${applyTransforms ? 'validates' : 'asserts'} ${print(input)}` + 
            (expectingError  
                ? ' is invalid' + (test.error === true ? '' : ` "${test.error}"`)
                : expectOutputDifferentFromInput 
                    ? ` to ${print(test.output)}`
                    : ' is valid'
            )

        // run test
        it(testTitle, () => {
            const { grade, output, error } = runValidationTest(validate, test)
            if (!grade.pass) {
                throw new FailedValidationTestError(
                    grade.reason, 
                    { output, error }
                )
            }
        })
    }
}

