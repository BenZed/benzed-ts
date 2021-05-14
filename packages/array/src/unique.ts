import isIterable from './is-iterable'

/*** Helper ***/

function* iterate<T>(iterable: ArrayLike<T> | Iterable<T>): Iterable<T> {

    if (isIterable(iterable))
        for (const item of iterable)
            yield item

    else for (let i = 0; i < iterable.length; i++)
        yield iterable[i]
}

/*** Main ***/

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

/*** Exports ***/

export default unique