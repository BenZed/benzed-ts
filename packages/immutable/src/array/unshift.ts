
import copy from '../copy'

//// Shortcuts ////

const { unshift: _unshift } = Array.prototype

type UnshiftParams = Parameters<typeof Array.prototype.unshift>

//// Main ////

/**
 * Immutably unshift an ArrayLike.
 * 
 * @returns A clone of the input Arraylike not including the final, unshifted off item.
 */
export default function unshift<T extends ArrayLike<unknown>>(
    input: T,
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    ...args: UnshiftParams
): typeof input {
    const output = copy(input)

    _unshift.apply(output, args)

    return output
}

export { unshift }