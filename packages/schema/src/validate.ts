import { Method } from '@benzed/traits'

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
 * Input type of a validate method
 */
export type ValidateInput<V extends Validate> = 
    V extends (first: infer I, ...args: any) => any ? I : unknown

/**
 * Output type of a validate method
 */
export type ValidateOutput<V extends Validate> =
    V extends (...args: any) => infer O ? O : unknown

/**
 * The validate method takes an input an optionally a set of validate options and
 * either returns a valid output or throws a validation error.
 */
export class Validate<I = any, O extends I = I> 
    extends Method<(input: I, options?: ValidateOptions) => O> {}
