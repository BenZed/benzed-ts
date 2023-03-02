
import { isArray } from '@benzed/util'

import first from './first'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type Unwrap<T> = T extends readonly [infer V, ...unknown[]]
    ? V
    : T extends (infer V)[] | readonly (infer V)[]
    /**/ ? V | undefined
    /**/ : T

//// Main ////

/**
 * Unwraps an array if it is one.
 *
 * @param  {type} array Object to unwrap.
 * @return {type}     If input is an array, returns the first value, otherwise
 *                    returns the input.
 */
function unwrap<T>(array: T): Unwrap<T> {
    return (isArray(array)
        ? first(array)
        : array) as Unwrap<T>
}

//// Exports ////

export default unwrap
