import type { Validator } from '@benzed/schema'

import { Is } from './is' 
import { To } from './to'

//// Main Export ////

export const is = new To<[],[]>()
 
export default is

//// Additional Exports ////

export { Is }

export * from '@benzed/schema'

/**
 * Cleaner type signature for Validators with an unknown input.
 * (Which is all of them, as of this writing)
 */
export interface Validates<T> extends Validator<unknown, T> {}

/**
 * Utility for declaring is schematics for a specific type
 */
export interface IsType<T> extends Is<Validates<T>> {}
