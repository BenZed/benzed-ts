import { isPrimitive, keysOf } from '@benzed/util'
import { it } from '@jest/globals'

import { Validate } from './validate' 

import type {
    ValidationTest,
    ValidationTestResult,
    ValidationContractViolations,
    runValidatorContractTests as RunValidatorContractTests,
    ValidatorContractTestSettings
} from './validation-test'

//// Helper Method ////

class FailedValidationTest extends Error {
    constructor(
        reason: string,
        readonly violations: ValidationContractViolations[],
        readonly expected: Pick<ValidationTestResult<unknown,unknown>, 'error' | 'output'>
    ) {
        super(reason)
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

    // Pretty-print method for making the title readable
    const print = (input: unknown):string => isPrimitive(input) 
        ? String(input) 
        : JSON.stringify(input)

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

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { runValidationTest } = require('./validation-test') as typeof import('./validation-test')

        // run test
        it(testTitle, () => {
            const { grade, output, error } = runValidationTest(validate, test)
            if (!grade.pass) {
                throw new FailedValidationTest(
                    grade.reason, 
                    grade.violations,
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
export function testValidateContract<I, O extends I>(
    validate: Validate<I,O>,
    settings: ValidatorContractTestSettings<I,O>
): void {

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { runValidatorContractTests, ValidationContractViolations } = require('./validation-test') as typeof import('./validation-test')
        
    const results = runValidatorContractTests(validate, settings)

    for (const name in keysOf(ValidationContractViolations)) {

        const description = (ValidationContractViolations as 
                Record<string,ValidationContractViolations>)[name]

        it(`${name}: ${description}`, () => {
            if (results.violations.includes(description))
                throw new Error(`${name} violated.`)
        })
    }

}

//// Helper ////

