import { isPrimitive } from '@benzed/util'
import { copy } from '@benzed/immutable'
import { it, expect } from '@jest/globals'

import { Validate } from './validate'
import ValidationError from './validation-error'
import ValidationContext from './validation-context'

import {
    ValidationTest,
    runValidationTest,
    ValidationTestResult,
    ValidationContractViolations
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
    validate: Validate<I, O>,
    config: {

        /**
         * Valid input that does not require transformation
         */
        validInput: I

        /**
         * Invalid input that will result in an error weather transforms
         * are enabled or not
         */
        invalidInput: I

        /**
         * An input requiring transformation.
         */
        transformableInput: I

        /**
         * Valid transformed result of the transformable input
         */
        transformedOutput: O
    }
): void {

    const { validInput, invalidInput, transformableInput, transformedOutput } = config

    const assertPass = runValidationTest(validate, { asserts: copy(validInput) })

    const assertFail = runValidationTest(validate, { asserts: invalidInput, error: true })

    const assertWithTransformableInput = runValidationTest(validate, { asserts: transformableInput })

    const transformPass = runValidationTest(validate, { 
        transforms: copy(transformableInput), 
        output: transformedOutput 
    })

    const transformFail = runValidationTest(validate, { transforms: invalidInput, error: true})

    it('expected test results', () => {
        expect(assertFail).toHaveProperty('error')
        expect(assertPass).toHaveProperty('output')
        expect(transformPass).toHaveProperty('output')
        expect(transformFail).toHaveProperty('error')
    })

    it('#1 converts given options into ValidateContext object.', () => {
        expect(assertFail.error).toBeInstanceOf(ValidationContext)
        expect(assertFail.error).toHaveProperty('transform', false)
    
        expect(transformFail.error).toBeInstanceOf(ValidationContext)
        expect(transformFail.error).toHaveProperty('transform', true)
    })

    it('#2 transform is true by default', () => {
        expect(validate(transformableInput)).toEqual(transformedOutput)
    }) 
 
    it('#3 throws validation errors on failed transformations or assertions', () => {
        expect(assertFail.error).toBeInstanceOf(ValidationError)
        expect(transformFail.error).toBeInstanceOf(ValidationError)
    })

    it('#4 converts transformable input into valid output when transformations are enabled', () => {
        expect(transformPass.output).toEqual(transformedOutput)
        expect(transformFail.error).toBeInstanceOf(ValidationError)

        if ('output' in assertWithTransformableInput)
            expect(assertWithTransformableInput.output).toEqual(transformableInput)
    })

    it('#5 provides transformed input to context without mutating the given input', () => {
        expect(transformFail.error).toBeInstanceOf(ValidationContext)

        // proves that the test.asserts input is the same as the validInput, and thus not mutated
        expect(assertPass.test).toHaveProperty('asserts', validInput)

        // proves that the test.transforms input is the same as the transformedOutput, and thus not mutated
        expect(transformPass.test).toHaveProperty('transforms', transformableInput)
    })

}

//// Helper ////

