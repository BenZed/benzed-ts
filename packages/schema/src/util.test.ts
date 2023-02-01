import { ansi, isPrimitive, keysOf } from '@benzed/util'
import { it } from '@jest/globals'

import { Validate } from './validate'

import {
    ValidationTest,
    ValidationTestResult,
    ValidationContractViolations,
    ValidatorContractTestSettings,
    runValidationContractTests, 
    runValidationTest
} from './validation-test'

//// Helper////

class FailedValidationTest extends Error {
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

// Pretty-print method for making the title readable
const print = (input: unknown):string => isPrimitive(input) 
    ? String(input) 
    : JSON.stringify(input)

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
                ? ` is invalid: "${test.error}"`
                : expectOutputDifferentFromInput 
                    ? ` to ${print(test.output)}`
                    : ' is valid'
            )

        // run test
        it(testTitle, () => {
            const { grade, output, error } = runValidationTest(validate, test)
            if (!grade.pass) {
                throw new FailedValidationTest(
                    grade.reason, 
                    { output, error }
                )
            }
        })
    }
}

/**
 * Test that a validator fulfills all of the tenants 
 * of the validation contract.
 */
export function testValidationContract<I, O extends I>(
    validate: Validate<I,O>,
    settings: ValidatorContractTestSettings<I,O>
): void {

    const results = runValidationContractTests(validate, settings)

    for (const name of keysOf(ValidationContractViolations)) {

        const description = (
            ValidationContractViolations as Record<string,ValidationContractViolations>
        )[name]

        it(`${name}:\n\t${description}`, () => {
            if (results.violations.includes(description)) {
                throw new Error(
                    `${name} violation`
                )
            }
        })
    }
}

//// Helper ////

