import { ValidateOptions } from './validate'

//// Main ////

/**
 * An object containing data related to a validation call.
 */
class ValidationContext<T> implements ValidateOptions {

    /**
     * Input received by the current validation
     */
    readonly input: T

    /**
     * True if transformations are to be applied to the 
     * output during this 
     */
    readonly transform: boolean
    transformed: T

    // readonly parent?: ValidateContext<T>

    constructor(input: T, options?: ValidateOptions) {
        this.input = input
        this.transformed = input
        this.transform = options?.transform ?? true
    }

}

//// Exports ////

export default ValidationContext

export {
    ValidationContext
}