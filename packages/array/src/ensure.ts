/*** Shortcuts ***/

const { indexOf, push } = Array.prototype

/*** Main ***/

/**
 * If a value exists does not exist in an arraylike collection, it
 * adds it to the collection. Otherwise, it does nothing.
 * 
 * ```typescript
 * ensure([1], 1) // [1]
 * ensure([1], 2) // [1, 2]
 * ```
 * 
 * @param arrayLike Collection
 * @param value Value to ensure
 */
function ensure<T>(arrayLike: ArrayLike<T>, value: T): typeof arrayLike {

    const index = indexOf.call(arrayLike, value)
    if (index === -1)
        push.call(arrayLike, value)

    return arrayLike
}

/*** Exports ***/

export default ensure