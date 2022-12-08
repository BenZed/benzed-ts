
import copy from '../copy'

//// Shortcuts ////

const { sort: _sort } = Array.prototype

type SortParams = Parameters<typeof Array.prototype.sort>

//// Main ////

/**
 * Immutably sort an ArrayLike.
 * 
 * @returns A sorted clone of the input array-like
 */
export default function sort<T extends ArrayLike<unknown>>(
    input: T,
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    ...args: SortParams
): typeof input {

    const output = copy(input)

    _sort.apply(output, args)

    return output
}

export { sort }