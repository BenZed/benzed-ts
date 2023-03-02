
import { equals } from '@benzed/immutable'
import { isString, Mutable, nil } from '@benzed/util'
import ValidationContext from './validation-context'

import { ValidationError } from './validation-error'
import { Validator } from './validator'

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

export type ValidationTestResult<I, O > = {

    readonly validator: Validator<I,O>

    readonly test: ValidationTest<I,O>

    readonly output?: O

    readonly error?: string

    readonly grade: { pass: true } | { pass: false, reason: string }
}

//// ValidationTest ////

export function runValidatorTest<I,O >(
    validator: Validator<I,O>,
    test: ValidationTest<I,O>
): ValidationTestResult<I,O> {

    // Prepare Test
    const applyTransforms = 'transforms' in test
    const input = applyTransforms ? test.transforms : test.asserts

    // Conduct Test
    const ctx = validator[Validator.analyze](
        new ValidationContext<I,O>(input, { transform: applyTransforms })
    )

    const result = ctx.hasValidOutput() ? { output: ctx.getOutput() } : { error: new ValidationError(ctx).message }

    const expectingError = 'error' in test && !!test.error
    const expectOutputDifferentFromInput = 'output' in test && applyTransforms
    let failReason: string | nil = nil

    if (expectingError && !result.error)
        failReason = 'Did not receive expected error.'

    else if (!expectingError && result.error)
        failReason = 'Received unexpected error.'
    
    else if (
        expectingError && 
        isString(test.error) && 
        !result.error?.includes(test.error)
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
        validator,
        test,
        grade
    }
} 