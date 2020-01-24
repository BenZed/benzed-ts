/******************************************************************************/
// Shortcuts
/******************************************************************************/

const { indexOf } = Array.prototype

/******************************************************************************/
// Main
/******************************************************************************/

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
    this: ArrayLike<T> | void,
    haystack: ArrayLike<T>,
    needle: T,
    delta = 1
): T | undefined {

    if (this != null) {
        delta = (needle == null ? 1 : needle) as number
        needle = haystack as unknown as T
        haystack = this
    }

    const length = haystack ? haystack.length : 0
    const index = indexOf.call(haystack, needle) + delta
    const indexWrapped = (index % length + length) % length

    return haystack
        ? haystack[indexWrapped]
        : undefined
}


/******************************************************************************/
// Exports
/******************************************************************************/

export default adjacent
