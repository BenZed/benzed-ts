import { returns } from './returns'
import { Falsy } from './types'

/* eslint-disable 
    @typescript-eslint/explicit-function-return-type
*/

/**
 * Quicker-to-type alais for undefined, so it can be used instead of nil.
 * 
 * Why undefined?
 * 
 * It's not typed as object, and it can be implicitly auto assignable in all cases.
 */
export type nil = undefined 

/**
 * Alias for undefined, to be used instead of null.
 */
export const nil: nil = undefined

/**
 * Given a value, return the value if it is truthy, otherwise return nil
 */
export const tryNil = <T>(input: T) => (input || nil) as T extends Falsy ? nil : T 

/**
 * Returns true if a value is nil
 */
export const isNil = (input: unknown): input is nil => input === nil

/**
 * Returns nil
 */
export const toNil = returns(nil)