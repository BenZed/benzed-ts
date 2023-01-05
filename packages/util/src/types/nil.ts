
import { returns } from '../methods/returns'
import { isNaN } from './primitive'

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
export const asNil = <T>(input: T) => (input == null || isNaN(input) ? nil : input) as T extends null | nil ? nil : T 

/**
 * Returns true if a value is nil
 */
export const isNil = (input: unknown): input is nil => input === nil

export const isNotNil = (input: unknown) => !isNil(input)

/**
 * Returns nil
 */
export const toNil = returns(nil)