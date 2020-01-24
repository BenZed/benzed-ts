
/***************************************************************/
// Helper
/***************************************************************/

function isIterable<T>(input: object): input is Iterable<T> {
    return Symbol.iterator in input
}

function* iterate<T>(iterable: ArrayLike<T> | Iterable<T>): Iterable<T> {

    if (typeof iterable === 'string' || isIterable(iterable)) for (const item of iterable)
        yield item

    else for (let i = 0; i < iterable.length; i++)
        yield iterable[i]
}

/******************************************************************************/
// Main
/******************************************************************************/

/**
 * Returns an array of the unique items in the given ArrayLike
 * @param this ArrayLike so this function can be bound as an alternative to providing a first argument
 * @param arrayLike 
 */
function unique<T>(
    this: ArrayLike<T> | Iterable<T> | void,
    arrayLike: ArrayLike<T> | Iterable<T> | void
): T[] {

    const arrayUnique: T[] = []

    if (this !== undefined)
        arrayLike = this

    if (arrayLike)
        for (const item of iterate(arrayLike))
            if (!arrayUnique.includes(item))
                arrayUnique.push(item)

    return arrayUnique
}

/***************************************************************/
// Exports
/***************************************************************/

export default unique