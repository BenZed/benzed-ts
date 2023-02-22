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

    /**
     * Optional key to associate with the validated value,
     * useful for sub validations of container values.
     */
    readonly key?: PropertyKey
}

/**
 * A method that takes an input and validate options, returning a valid output.
 */
export interface Validate<I, O extends I = I> {
    (input: I, options?: ValidateOptions): O
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
