import { returns } from './returns'

/* eslint-disable 
    @typescript-eslint/explicit-function-return-type
*/

/**
 * Result of a void expression for use or application
 */
export const voided = undefined as void

/**
 * Remove the other 'non-value' values in favour of void.
 */
export const asVoid = <T>(input: T) => (input == null ? voided : input) as T extends null | undefined ? void : T 

/**
 * Returns true if a value is void
 */
export const isVoid = (input: unknown): input is void => input === voided

/**
 * Returns void
 */
export const toVoid = returns(voided)

