import { isArrayLike, isIterable, Empty } from './types'

//// Helper ////

/**
 * Typesafe iteration of the keys of given object.
 */
function * keysOf<T extends object> (object: T): Generator<keyof T> {
    for (const key in object)
        yield key
}

/**
 * Typesafe iteration of the indexes of a given array-like
 */
function * indexesOf<T extends ArrayLike<unknown>>(arrayLike: T): Generator<number> {
    for (let i = 0; i < arrayLike.length; i++)
        yield i
}

function numKeys(object: object): number {
    let count = 0

    const keyIterator = keysOf(object)
    while (!keyIterator.next().done)
        count++ 

    return count
}

function isEmpty(object: object): object is Empty {
    return numKeys(object) === 0
}

//// Main ////

/**
 * Iterate through generic collections
 */
function* iterate<T>(
    object:
    ArrayLike<T> |
    Iterable<T> |
    Record<string | number, T> |
    object

): Generator<T> {

    if (isArrayLike<T>(object)) {

        // ArrayLike<T>
        for (const index of indexesOf(object as { length: number }))
            yield object[index]

    } else if (isIterable(object)) {

        // Iterable<T>
        for (const value of object as Iterable<T>)
            yield value

    } else {

        for (const key of keysOf(object))
            yield object[key]
    }

}

//// Exports ////

export default iterate

export {
    iterate,

    keysOf,
    numKeys,
    isEmpty,

    indexesOf
}