import { isPrimitive, isString } from '@benzed/util'
import { copy } from '@benzed/immutable'
import { it, describe } from '@jest/globals'

import { 
    Validate, 
    ValidationContext, 
    ValidationError 
} from './validate'

//// Types ////

export type ValidationTestTransformsInput<I> = {
    /**
     * Perform a test with transforms enabled,
     * with this value as input.
     */
    readonly transforms: I
}

export type ValidationTestAssertsInput<I> = {
    /**
     * Perform a test with transforms disabled,
     * using this value as input.
     */
    readonly asserts: I
}

export type ValidationTestError = {
    /**
     * Test is expected to throw a validation error containing this string.
     * 
     * Optionally provide `true` to accept any validation error.
     */
    readonly error: string | true
}

export type ValidationTestOutput<O> = {
    /**
     * Test is expected to give this output.
     */
    readonly output: O
}

/**
 * Peform a transform validation test.
 * If neither an error nor output is not defined, it is expected that the output
 * will be the same as the input.
 */
export type ValidationTransformTest<I,O> = 
    ValidationTestTransformsInput<I> & 
    (ValidationTestError | Partial<ValidationTestOutput<O>>)

/**
 * Peform a trasnform assertion test.
 * If an error is not defined, it is expected that the output will 
 * be the same as the input.
 */
export type ValidationAssertTest<I> = 
    ValidationTestAssertsInput<I> & Partial<ValidationError<I>>

export type ValidationTest<I,O> = 
    ValidationTransformTest<I,O> | ValidationAssertTest<I>

export type ValidationTestResult<I, O extends I> = {

    validator: Validate<I,O>

    test: ValidationTest<I,O>

    output?: O

    error?: ValidationError<I>

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
        const expectOutputDifferentFromInput = 'output' in test

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

            const result = runValidationTest(validate, test)

            if (expectingError && isString(test.error)) 
                expect(result.error?.message).toContain(test.error)

            if (expectingError) 
                expect(result.error).toBeInstanceOf(ValidationError)

            else if (expectOutputDifferentFromInput)
                expect(result.output).toEqual(test.output)

            else
                expect(result.output).toEqual(input)

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

    describe(`valdator${validate.name} validation contract`, () => {

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
            console.log(assertFail.error?.context)
            expect(assertFail.error?.context).toBeInstanceOf(ValidationContext)
            expect(assertFail.error?.context).toHaveProperty('transform', false)
    
            expect(transformFail.error?.context).toBeInstanceOf(ValidationContext)
            expect(transformFail.error?.context).toHaveProperty('transform', true)
        })

        it('#2 transform is true by default', () => {
            expect(validate(transformableInput)).toEqual(transformedOutput)
        })

        it('#3 throws validation errors on failed transformations or assertions', () => {
            expect(assertFail.error).toBeInstanceOf(ValidationError)
            expect(transformFail.error).toBeInstanceOf(ValidationContext)

        })

        it('#4 converts transformable input into valid output when transformations are enabled', () => {
            expect(transformPass.output).toEqual(transformedOutput)
            expect(transformFail.error).toBeInstanceOf(ValidationError)

            if ('output' in assertWithTransformableInput)
                expect(assertWithTransformableInput.output).toEqual(transformableInput)
        })

        it('#5 provides transformed input to context without mutating the given input', () => {
            expect(transformFail.error?.context).toBeInstanceOf(ValidationContext)

            // proves that the test.asserts input is the same as the validInput, and thus not mutated
            expect(assertPass.test).toHaveProperty('asserts', validInput)

            // proves that the test.transforms input is the same as the transformedOutput, and thus not mutated
            expect(transformPass.test).toHaveProperty('transforms', transformedOutput)
        })

    })

}

//// Helper ////

const runValidationTest = <I,O extends I>(
    validate: Validate<I,O>,
    test: ValidationTest<I,O>
): ValidationTestResult<I,O> => {

    const applyTransforms = 'transforms' in test
    const input = applyTransforms ? test.transforms : test.asserts

    const result: ValidationTestResult<I,O> = { validator: validate, test }
    try {
        result.output = validate(input, { transform: applyTransforms })
    } catch (e) {
        result.error = e
    }

    return result
}
