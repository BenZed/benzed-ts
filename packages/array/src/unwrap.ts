import { assertDefined } from '@benzed/util'
import first from './first'

/**
 * Unwraps an array if it is one.
 *
 * @param  {type} array Object to unwrap.
 * @return {type}     If input is an array, returns the first value, otherwise
 *                    returns the input.
 */
function unwrap<T>(array: T | T[]): T | undefined {
    return Array.isArray(array)
        ? first(array)
        : array
}

/*** Exports ***/

unwrap.assert = assertDefined(unwrap)

export default unwrap
