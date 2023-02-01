
import { isString, Mutable, nil } from '@benzed/util'

import { Validate } from './validate'
import { ValidationError } from './validation-error'
import { ContractValidator } from './validator'

//// Types ////

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

    readonly grade: 
    | { pass: true }
    | { pass: false, reason: string, violations: ValidationContractViolations[] }
}

export enum ValidationContractViolations {

    OptionsToValidateContext = 'A validator will create a ValidationContext ' +
        'out of a provided input and options.',

    TransformEnabledByDefault = 'Transform option is considered enabled by default ' +
        'if not provided.',

    ImmutableTransforms = 'Weather or not transformations are enabled, input will ' +
        'be immutably transformed and provided to the context.',

    ThrowsValidationErrors = 'Throws validation errors when validation fails.',

    TransitiveEquality = 'If defined, a validate function\'s equal() method ' +
        'must have transitive logic; a valid input should be equal to a valid ' +
        'output and vice versa.'

}

export type ValidatorContractTestSettings<I, O extends I> = {

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

//// Main ////

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

    const expectingError = 'error' in test
    const expectOutputDifferentFromInput = 'output' in test && applyTransforms
    let failReason: string | nil = nil
    const violations: ValidationContractViolations[] = []

    if (!expectingError && result.error) 
        failReason = 'Received unexpected error.'

    else if (expectingError && !(result.error instanceof ValidationError))
        failReason = `Received error, but it is not an instance of expected ${ValidationError.name} class`
        
    else if (expectingError && isString(test.error) && !result.error?.message.includes(test.error)) 
        failReason = 'Received error, but it did not contain expected error message.'

    else if (!expectingError) {
        const o = result.output as O
        const i = expectOutputDifferentFromInput ? test.output as I : input

        const equal = (validate.equal ?? ContractValidator.prototype.equal).bind(validate)

        const isOutputValid = equal(i, o)
        if (!isOutputValid)
            failReason = 'Expected output is invalid.'

        if (isOutputValid && !equal(o, i))
            violations.push(ValidationContractViolations.TransitiveEquality)
    }

    if (violations.length > 0 && !failReason)
        failReason = 'Validation contract violations.'

    // Grade

    const grade = (
        failReason 
            ? { pass: false, reason: failReason, violations } 
            : { pass: true }
    ) satisfies ValidationTestResult<I,O>['grade']

    return {
        ...result,
        grade
    }
} 

/**
 * Run a series of tests to ensure the given validator fulfills
 * all of the tenants of the validate contract
 */
export function runValidatorContractTests<I, O extends I>(
    validate: Validate<I, O>,
    config: ValidatorContractTestSettings<I,O>
): { 
        results: ValidationTestResult<I,O>[] 

        get grade(): boolean 

        get violations(): ValidationContractViolations[]

    } {

    const { validInput, invalidInput, transformableInput, transformedOutput } = config

    const results = [
        runValidationTest(validate, { asserts: validInput }),
        runValidationTest(validate, { asserts: invalidInput, error: true }),
        runValidationTest(validate, { asserts: transformableInput }),
        runValidationTest(validate, { transforms: transformableInput, output: transformedOutput }),
        runValidationTest(validate, { transforms: invalidInput, error: true})
    ]

    return {

        results,

        get grade(): boolean {
            return this.results.every(result => result.grade)
        },

        get violations(): ValidationContractViolations[] {
            return this
                .results
                .flatMap(({ grade }) => grade.pass ? [] : grade.violations)
        }

    }

}