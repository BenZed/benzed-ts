
import { isNaN } from './primitive'

/* eslint-disable 
    @typescript-eslint/explicit-function-return-type
*/

/**
 * Alias for undefined
 */
export type nil = undefined

export const nil = undefined

/**
 * Returns nil if the given input is nil, null or NaN, otherwise it returns the input value.
 */
export const asNil = <T>(input: T) => (input == null || isNaN(input) ? nil : input) as T extends null | nil ? nil : T 

/**
 * Returns true if a value is nil, null or NaN
 */
export const isNil = (input: unknown): input is nil => asNil(input) === nil

export const isNotNil = (input: unknown) => !isNil(input)

/**
 * Returns nil
 */
export const toNil = () => nil