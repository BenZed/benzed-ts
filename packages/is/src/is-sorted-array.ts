import { isArrayOfSortable } from './is-array-of'
import { Sortable } from './types'

/*** Main ***/

/**
 * Returns true if the given value is a sorted array.
 * @param input Any value.
 * @param isAscending True if array must be ascending, false if must be descending, 
 * or undefined for irrelevent.
 * @returns true if sorted, false otherwise.
 */
function isSortedArray<T extends Sortable>(
    input: unknown,
    isAscending?: boolean
): input is T[] {

    if (!isArrayOfSortable(input))
        return false

    if (isAscending === undefined)
        isAscending = input[0] < input[input.length - 1]

    let value: Sortable = isAscending ? -Infinity : Infinity

    for (const item of input) {

        const isInOrder = isAscending
            ? item >= value
            : item <= value

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