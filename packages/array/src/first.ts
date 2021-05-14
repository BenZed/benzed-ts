
/**
 * Returns the first element of an ArrayLike.
 * @param arrayLike 
 */
function first<T>(arrayLike: ArrayLike<T>): T | undefined {
    return arrayLike[0]
}

/*** Exports ***/

export default first