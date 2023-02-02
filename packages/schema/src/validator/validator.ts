import { Validate } from '../validate'

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

    readonly target: Validate<I,O>

}

export type AnyValidator = Validator<any,any>
