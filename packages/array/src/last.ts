import { assertDefined } from '@benzed/util'

/**
 * Returns the last element of an ArrayLike.
 * @param arrayLike 
 */
function last<T>(arrayLike: ArrayLike<T>): T | undefined {
    return arrayLike[arrayLike.length - 1]
}

last.assert = assertDefined(last)

/*** Exports ***/

export default last