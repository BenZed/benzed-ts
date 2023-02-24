
import { equals } from '@benzed/immutable'
import { isString, Mutable, nil } from '@benzed/util'

import { Validate } from './validate'
import { ValidationError } from './validation-error'

//// ValidationTest types ////

export type ValidationTestTransformsInput<I> = {

    /**
     * Perform a test with transforms enabled,
     * with the provided value as input.
     */
    readonly transforms: I 

}

export type ValidationTestAssertsInput<I> = {

    /**
     * Perform a test with transforms disabled,
     * using the provided value as input.
     */
    readonly asserts: I

}

export type ValidationTestError = {

    /**
     * If a error message value or 'true', validation tests expects an error.
     * Validation errors are expected to contain the string, if given.
     */
    readonly error: string | boolean
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
    ValidationTestTransformsInput<I> & (ValidationTestError | Partial<ValidationTestOutput<O>>)

/**
 * Peform a transform assertion test.
 * If an error is not defined, it is expected that the output will 
 * be the same as the input.
 */
export type ValidationAssertTest<I> = 
    ValidationTestAssertsInput<I> & Partial<ValidationTestError>

export type ValidationTest<I,O> = 
    ValidationTransformTest<I,O> | ValidationAssertTest<I>

export type ValidationTestResult<I, O extends I> = {

    readonly validate: Validate<I,O>

    readonly test: ValidationTest<I,O>

    readonly output?: O

    readonly error?: ValidationError<I>

    readonly grade: { pass: true } | { pass: false, reason: string }
}

//// ValidationTest ////

export function runValidationTest<I,O extends I>(
    validate: Validate<I,O>,
    test: ValidationTest<I,O>
): ValidationTestResult<I,O> {

    // Prepare Test
    const applyTransforms = 'transforms' in test
    const input = applyTransforms ? test.transforms : test.asserts

    // Conduct Test
    const result: Mutable<Omit<ValidationTestResult<I,O>, 'grade'>> = { validate, test }
    try {
        result.output = validate(input, { transform: applyTransforms })
    } catch (e) {
        result.error = e as ValidationError<I>
    }

    // Analyze Test 

    const expectingError = 'error' in test && !!test.error
    const expectOutputDifferentFromInput = 'output' in test && applyTransforms
    let failReason: string | nil = nil

    if (expectingError && result.error && !(result.error instanceof ValidationError)) 
        failReason = `Received error, but it is not an instance of expected ${ValidationError.name} class`

    if (expectingError && !result.error) 
        failReason = 'Did not receive expected error.'

    else if (!expectingError && result.error)
        failReason = 'Received unexpected error.'
    
    else if (
        expectingError && 
        isString(test.error) && 
        !result.error?.message.includes(test.error)
    )
        failReason = 'Received error, but it did not contain expected error message.'

    else if (!expectingError) {
        const o = result.output as O
        const i = expectOutputDifferentFromInput ? test.output as I : input

        const isOutputValid = equals(i, o)
        if (!isOutputValid)
            failReason = 'Expected output is invalid.'
    }

    // Grade

    const grade = (
        failReason 
            ? { pass: false, reason: failReason } 
            : { pass: true }
    ) satisfies ValidationTestResult<I,O>['grade']

    return {
        ...result,
        grade
    }
} 