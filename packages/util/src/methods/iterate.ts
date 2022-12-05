import { indexesOf, isArrayLike, isIterable, keysOf } from '../types'

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

}

//// Exports ////

export default iterate

export {
    iterate
}