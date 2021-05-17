
import copy from '../copy'

/*** Shortcuts ***/

const { sort: _sort } = Array.prototype

type SortParams = Parameters<typeof Array.prototype.sort>

/*** Main ***/

/**
 * Immutably shift an ArrayLike.
 * 
 * @returns A clone of the input Arraylike not including the final, popped off item.
 */
export default function shift<T extends ArrayLike<unknown>>(
    input: T,
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    ...args: SortParams
): typeof input {

    const output = copy(input)

    _sort.apply(output, args)

    return output
}
