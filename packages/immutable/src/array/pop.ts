import copy from '../copy'

/*** Shortcuts ***/

const { pop: _pop } = Array.prototype

/*** Main ***/

/**
 * Immutably pop an ArrayLike.
 * 
 * @returns A clone of the input Arraylike not including the final, popped off item.
 */
export default function pop<T extends ArrayLike<unknown>>(input: T): typeof input {
    const output = copy(input)
    _pop.call(output)
    return output
}

export { pop }