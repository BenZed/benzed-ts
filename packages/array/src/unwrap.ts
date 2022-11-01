/* eslint-disable @typescript-eslint/no-explicit-any */

import { isArray } from '@benzed/is'
import { assertDefined } from '@benzed/util'
import first from './first'

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

unwrap.assert = assertDefined(unwrap)

export default unwrap
