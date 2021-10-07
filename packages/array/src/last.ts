
/**
 * Returns the last element of an ArrayLike.
 * @param arrayLike 
 */
function last<T>(arrayLike: ArrayLike<T>): T | undefined {
    return arrayLike[arrayLike.length - 1]
}

/*** Exports ***/

export default last