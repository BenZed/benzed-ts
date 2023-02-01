import type { InputOf, OutputOf } from '@benzed/util'

//// Eslint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Types ////

export interface ValidateOptions {

    /**
     * True if transformations are to be applied
     * during in the validation call, false if not.
     */
    readonly transform?: boolean

}

/**
 * A method that takes an input and returns a valid output.
 * 
 * The validate contract:
 * 
 * 1) A validator will convert the given input and options
 *    into a ValidateContext object.
 * 
 * 2) If a transform option is not specified, it is true by default.
 * 
 * 3) If transformations are disabled, the validator will throw a 
 *    validation error if the input is not a valid output.
 * 
 * 4) If transformations are enabled, the validator will attempt to 
 *    transform an input into an expected output. If that transformation 
 *    fails, the validator will throw a validation error, asserting 
 *    that the input data is invalid. 
 * 
 * 5) Weather transformations are enabled or not, the validator will
 *    apply any transformations to the input and assign the 'transformed'
 *    property of it's context object in an immutable way that does 
 *    not alter it's input.
 */
export interface Validate<I, O extends I = I> {
    (input: I, options?: ValidateOptions): O

    /**
     * Logic for determining if a validators input is equal to it's 
     * output and vise versa, so implementations must be transitive.
     */
    equal?<T extends I | O>(input: I | O, output: T): input is T

}

/**
 * Input type of a validate method
 */
export type ValidateInput<V extends AnyValidate> = InputOf<V>

/**
 * Output type of a validate method
 */
export type ValidateOutput<V extends AnyValidate> = OutputOf<V>

export type AnyValidate = Validate<any>
