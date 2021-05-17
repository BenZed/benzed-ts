import copy from '../copy'

/*** Shortcuts ***/

const { splice: _splice } = Array.prototype

/*** Types ***/

type SpliceParams = Parameters<typeof Array.prototype.splice>

/*** Main ***/

/**
 * Splice an Array immutably; returned Array is a spliced copy of the 
 *
 * @return {type} The spliced array.
 */
export default function splice<T extends ArrayLike<unknown>>(
    input: T,
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    ...args: SpliceParams
): typeof input {

    const output = copy(input)

    _splice.apply(output, args)

    return output
}