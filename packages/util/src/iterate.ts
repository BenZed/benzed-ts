
//// Helper ////

function isIterable<T>(input: unknown): input is Iterable<T> {

    const type = typeof input

    return type === 'string' ||

        (
            type === 'function' || 
            type === 'object' && 
            input !== null
        ) && 

        typeof (input as Iterable<T>)[Symbol.iterator] === 'function'

}

/**
 * Typesafe iteration of the keys of given object.
 */
function * keysOf<T extends object> (object: T): Generator<keyof T> {

    const { keys, getOwnPropertySymbols } = Object

    for (const key of [
        ...keys(object),
        ...getOwnPropertySymbols(object)
    ])
        yield key as keyof T
}

/**
 * Typesafe iteration of the indexes of a given array-like
 */
function * indexesOf<T extends ArrayLike<unknown>>(arrayLike: T): Generator<number> {
    for (let i = 0; i < arrayLike.length; i++)
        yield i
}

function numKeys(object: object): number {
    return [
        ...keysOf(object)
    ].length
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

    if (typeof object === 'string' || 'length' in object) {

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
    isIterable,

    keysOf,
    numKeys,

    indexesOf
}