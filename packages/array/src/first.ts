
/**
 * Returns the first element of an ArrayLike.
 * @param arrayLike 
 */
function first<T>(arrayLike: ArrayLike<T>): T | undefined {

    return arrayLike
        ? arrayLike[0]
        : undefined
}

/***************************************************************/
// Exports
/***************************************************************/

export default first