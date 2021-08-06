import copy from '../copy'

/*** Shortcuts ***/

const { reverse: _reverse } = Array.prototype

/*** Main ***/

/**
 * Immutably reverse an Arraylike.
 * 
 * @returns A clone of the input, reversed.
 */
export default function reverse<T extends ArrayLike<unknown>>(
    arr: T,
): typeof arr {
    const output = copy(arr)

    _reverse.apply(output)

    return output
}

export { reverse }