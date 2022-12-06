import { indexesOf, isArrayLike, isIterable, keysOf, symbolsOf } from '../types'

//// Main ////

/**
 * Iterate through generic collections
 */
function* iterate<T>(
    ...objects: (
        ArrayLike<T> |
        Iterable<T> |
        Record<string | number, T> |
        object
    )[]
): Generator<T> {

    for (const object of objects) {
        if (isIterable(object)) {

            // Iterable<T>
            for (const value of object as Iterable<T>)
                yield value

        } else if (isArrayLike<T>(object)) {

            // ArrayLike<T>
            for (const index of indexesOf(object as { length: number }))
                yield object[index]

        } else {

            for (const key of keysOf(object))
                yield object[key]
        }
    }
}
iterate.keys = keysOf
iterate.symbols = symbolsOf
iterate.indexes = indexesOf

//// Exports ////

export default iterate

export {
    iterate
}