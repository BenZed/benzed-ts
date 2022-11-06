import resolveIndex from './resolve-index'
import { assertDefined } from '@benzed/util'

//// Shortcuts ////

const { indexOf } = Array.prototype

/**
 * Get the value adjacent to a given valuen in an Array, wrapping around to the
 * beginning or end.
 * 
 * If the value is not in the given array, it will return the first value in the 
 * array.
 * 
 * @param haystack Arraylike to check
 * @param needle value to check
 * @param delta index offset of the given value to return, defaults to 1
 */
function adjacent<T>(
    haystack: ArrayLike<T>,
    needle: T,
    delta = 1
): T | undefined {

    const { length } = haystack

    const index = indexOf.call(haystack, needle) + delta
    const indexResolved = resolveIndex(length, index)

    return haystack
        ? haystack[indexResolved]
        : undefined
}

adjacent.assert = assertDefined(adjacent)

//// Exports ////

export default adjacent
