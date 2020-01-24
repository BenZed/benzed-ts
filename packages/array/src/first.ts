
/**
 * 
 * Returns the first element of an ArrayLike.
 * 
 * @param this ArrayLike so this function can be bound as an alternative to providing a first argument
 * @param array 
 */
function first<T>(
    this: ArrayLike<T> | void,
    array: ArrayLike<T> | void
): T | undefined {

    if (this !== undefined)
        array = this

    return array
        ? array[0]
        : undefined
}

/***************************************************************/
// Exports
/***************************************************************/

export default first