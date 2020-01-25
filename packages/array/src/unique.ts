
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
 * @param arrayLike 
 */
function unique<T>(
    arrayLike: ArrayLike<T> | Iterable<T>
): T[] {

    const arrayUnique: T[] = []

    for (const item of iterate(arrayLike))
        if (!arrayUnique.includes(item))
            arrayUnique.push(item)

    return arrayUnique
}

/***************************************************************/
// Exports
/***************************************************************/

export default unique