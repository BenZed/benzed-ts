
import { isFunc, isObject, isString, Mutable, nil } from '@benzed/util'

import { Validate } from './validate'
import { ValidationError } from './validation-error'
import { ValidateStruct, ValidatorStruct } from './validator'

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
    | { pass: false, reason: string }
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

    const expectingError = 'error' in test
    const expectOutputDifferentFromInput = 'output' in test && applyTransforms
    let failReason: string | nil = nil

    if (expectingError && result.error && !ValidationError.is(result.error)) 
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

        const isOutputValid = ValidateStruct.equal(i, o)
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

//// ValidationContractTestTypes ////

export enum ValidationContractViolation {

    ValidatesValidInput = 'Validation will succeed if provided with valid input',

    AssertsInvalidInput = 'Valididation will fail if provided with invalid input',

    AssertsTransformableInput = 'Validation will fail if provided with transformable ' + 
        'input, but transformations are disabled',

    TransformsTransformableInput = 'Validation will succeed with transformed output ' + 
        'if transformations are enabled and transformation succeeds in creating a valid' + 
        'output.',

    TransformEnabledByDefault = 'Transform option is considered enabled by default ' +
        'if not provided.',

    ImmutableTransforms = 'Weather or not transformations are enabled, input will ' +
        'be immutably transformed and provided to the context.',

    ThrowsValidationErrors = 'Errors thrown during failed validation will have the structure' + 
        'of a ValidationError',

    AppliesValidationContextToErrors = 'When a validation error occurs, it will' + 
        'contain expected validation context properties',

    // TransitiveEquality = 'If defined, a validate function\'s equal() method ' +
    //     'must have transitive logic; a valid input should be equal to a valid ' +
    //     'output and vice versa.'

}

export type ValidatorContractTestSettings<I, O extends I> = {

    /**
     * Valid input that does not require transformation
     */
    readonly validInput: I

    /**
     * Invalid input that will result in an error weather transforms
     * are enabled or not
     */
    readonly invalidInput: I

    // Optional value. If omitted, it is assumed that this validator
    // does not use transformations. (An asserter)
    readonly transforms?: {
        /**
         * An input requiring transformation.
         * 
         */
        invalidInput: I

        /**
         * Valid transformed result of the transformable input
         */
        validOutput: O
    }
}

export interface ValidationContractTestResults {

    readonly grade: boolean

    readonly violations: readonly ValidationContractViolation[]

}

//// ValidationContractTests ////

/**
 * Run a series of tests to ensure the given validator fulfills
 * all of the tenants of the validate contract
 */
export function runValidationContractTests<I, O extends I>(
    validate: Validate<I, O>,
    config: ValidatorContractTestSettings<I,O>
): ValidationContractTestResults {
    
    const { validInput, invalidInput, transforms } = config

    const violations = new Set<ValidationContractViolation>
    
    const results = [
        runValidationTest(validate, { asserts: validInput }),
        runValidationTest(validate, { asserts: invalidInput, error: true }),
        runValidationTest(validate, { asserts: transforms?.invalidInput as I, error: true }),
        runValidationTest(validate, { transforms: transforms?.invalidInput as I, output: transforms?.validOutput as O }),
    ] as const

    const [ assertPass, assertFail, assertTransformFail, transformPass ] = results

    // ValidatesValidInput
    if (!assertPass.grade.pass)
        violations.add(ValidationContractViolation.ValidatesValidInput)

    // AssertsInvalidInput
    if (!assertFail.grade.pass)
        violations.add(ValidationContractViolation.AssertsInvalidInput)

    // AssertsTransformableInput 
    if (!assertTransformFail.grade.pass)
        violations.add(ValidationContractViolation.AssertsTransformableInput)

    // TransformsTransformableInput
    if (transforms && !transformPass.grade.pass)
        violations.add(ValidationContractViolation.TransformsTransformableInput)

    // TransformsEnabledByDefault
    if (transforms) {
        try {
            const output = validate(transforms.invalidInput)
            if (!ValidatorStruct.equal(output, transforms.validOutput))
                throw new Error('Transforms must not be enabled by default.')

        } catch {
            violations.add(ValidationContractViolation.TransformEnabledByDefault)
        }
    }

    // ImmutableTransforms
    if ((isObject(validInput) || isFunc(validInput)) && assertFail.error?.transformed === validInput)
        violations.add(ValidationContractViolation.ImmutableTransforms)

    // ThrowsValidationErrors
    if (results.some(r => !r.grade.pass && r.grade.reason.includes(ValidationError.name))) 
        violations.add(ValidationContractViolation.ThrowsValidationErrors)

    // AppliesValidationContextToErrors
    if (
        !ValidatorStruct.equal(assertFail.error?.input as I, invalidInput) 
        || assertFail.error?.transform // <- should be false
        // TODO check for transform set once we have a "report()" method that returns a validation context rather than an output
    )
        violations.add(ValidationContractViolation.AppliesValidationContextToErrors)

    // TransitiveEquality // TODO? Currently no interface for this
    // if (transforms) {
    //     if (equal(validInput, transforms.validOutput) !== equal(transforms.validOutput, validInput))
    //         violations.add(ValidationContractViolation.TransitiveEquality)
    // }

    return {
        grade: violations.size === 0,
        violations: [...violations]
    }
}