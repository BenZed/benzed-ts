
/**
 * Returns the first element of an ArrayLike.
 * @param arrayLike 
 */
function first<T>(
    arrayLike: ArrayLike<T>
): (typeof arrayLike) extends readonly [infer FirstT, ...unknown[]] ? FirstT : T | undefined {

    return arrayLike[0]
}

/*** Exports ***/

export default first