
import type { ValidateOptions } from './validate'

import { 
    ValidationError, 
    ValidationErrorDetail 
} from './validation-error'

//// Types ////

type ValidationResult<I,O> = 
    {
        readonly error: ValidationError<I>
    } | {
        readonly output: O
    }

//// Main ////

/**
 * An object containing data related to a validation call.
 */
class ValidationContext<I, O extends I> implements ValidateOptions {

    /**
     * Input received by the current validation
     */
    readonly input: I

    /**
     * Input with transformations applied to it.
     */
    transformed: I

    /**
     * Should contain an error property if validation failed, and an
     * output property if validation succeeded.
     */
    result?: ValidationResult<I,O>

    /**
     * True if transformations are to be applied to the output during this validation.
     * They will be applied to the 'transformed' property regardless, but they will
     * only be applied to the result.output if this value is true.
     */
    readonly transform: boolean

    /**
     * Optional key to associate with the validated value,
     * useful for sub validations of container values.
     */
    readonly key?: PropertyKey

    constructor(input: I, options?: ValidateOptions) {
        this.input = input
        this.transformed = input
        this.transform = options?.transform ?? true
    }

    setOutput(output: O): this {
        this.result = { output }
        return this
    }

    setError(detail: ValidationErrorDetail<I>): this {
        this.result = {
            error: new ValidationError({
                key: this.key,
                value: this.input,
                detail,
            })
        }
        return this
    }

}

//// Exports ////

export default ValidationContext

export {
    ValidationContext,
    ValidationResult
}