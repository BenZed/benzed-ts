
import { returns } from './returns'

/* eslint-disable 
    @typescript-eslint/explicit-function-return-type
*/

/**
 * Alias for undefined
 */
export type nil = undefined

/**
 * Result of a nil expression for use or application
 */
export const nil = undefined

/**
 * Remove the other 'non-value' values in favour of nil.
 */
export const asNil = <T>(input: T) => (input == null ? nil : input) as T extends null | undefined ? nil : T 

/**
 * Returns true if a value is nil
 */
export const isNil = (input: unknown): input is nil => input === nil

/**
 * Returns nil
 */
export const toNil = returns(nil)