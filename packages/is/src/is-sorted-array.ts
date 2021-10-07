import { isArrayOfSortable } from './is-array-of'
import { Sortable } from './types'

/*** Main ***/

function isSortedArray<T extends Sortable>(
    input: unknown
): input is T[] {

    if (!isArrayOfSortable(input))
        return false

    const isAscending = input[0] < input[input.length - 1]

    let value: Sortable = isAscending ? -Infinity : Infinity

    for (const item of input) {

        const isInOrder = isAscending
            ? item > value
            : item < value

        if (isInOrder)
            value = item
        else
            return false
    }

    return true
}

/*** Exports ***/

export default isSortedArray

export {
    isSortedArray
}