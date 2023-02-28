//// Eslint ////

import { Comparable, Copyable } from '@benzed/immutable'
import { Callable, Method, Trait } from '@benzed/traits'
import { assign } from '@benzed/util'

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Validate Types ////

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
 * The validate method takes an input an optionally a set of validate options and
 * either returns a valid output or throws a validation error.
 */
export interface Validate<I = any, O extends I = I> {
    (input: I, options?: ValidateOptions): O 
}

/**
 * Input type of a validate method
 */
export type ValidateInput<V extends Validate> = 
    V extends Validate<infer I, any> 
        ? I 
        : unknown

/**
 * Output type of a validate method
 */
export type ValidateOutput<V extends Validate> =
    V extends Validate<any, infer O> 
        ? O
        : unknown

