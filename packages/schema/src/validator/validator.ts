import { Validate } from '../validate'
import { ValidationErrorMessage } from '../validation-error'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Validator ////

/**
 * Any object with a validate method that validates based
 * on it's configuration.
 */
export interface Validator<I, O extends I> {

    readonly validate: Validate<I,O>

    // /**
    //  * Logic for determining if a validators input is equal to it's 
    //  * output and vise versa, so implementations must be transitive.
    //  */
    // equal?<T extends I | O>(input: I | O, output: T): input is T

    /**
     * Optional method for creating an error message when validation fails.
     */
    readonly message?: string | ValidationErrorMessage<I>

    readonly name: string

}

export type AnyValidator = Validator<any,any>
