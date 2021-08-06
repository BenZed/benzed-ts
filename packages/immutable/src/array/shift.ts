
import copy from '../copy'

/*** Shortcuts ***/

const { shift: _shift } = Array.prototype

/*** Main ***/

/**
 * Immutably shift an ArrayLike.
 * 
 * @returns A clone of the input Arraylike not including the final, popped off item.
 */
export default function shift<T extends ArrayLike<unknown>>(input: T): typeof input {
    const output = copy(input)

    _shift.call(output)

    return output
}

export { shift }