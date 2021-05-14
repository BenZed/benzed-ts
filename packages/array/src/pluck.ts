/*** Shortcuts ***/

const { splice } = Array.prototype

/*** Main ***/

/**
 * Removes a number of items from an array that pass a test.
 * 
 * ```typescript
 * const even = pluck([1, 2, 3, 4], v => v % 2 === 0) // [2,4], [1,3]
 * ```
 *
 * @param  {Array} input                 array to mutate
 * @param  {Function} test             predicate to run on each item
 * @param  {number} count = arr.length max number of items to remove. If this is a
 *                                     negative number, they'll be removed from the end
 *                                     of the array, rather than the beginning.
 * @return {Array}                     items removed via test
 */
function pluck<T>(
    input: ArrayLike<T>,
    test: (item: T, index: number, input: ArrayLike<T>) => boolean,
    count = input.length
): T[] {

    const results = []
    const indexes = []

    const reverse = count < 0
    if (reverse)
        count = -count

    for (
        let i = reverse ? input.length - 1 : 0;

        results.length < count && (reverse
            ? i >= 0
            : i < input.length);

        i += reverse ? -1 : 1
    ) {

        const value = input[i]
        if (!test(value, i, input))
            continue

        if (reverse) {
            results.unshift(value)
            indexes.push(i)
        } else {
            results.push(value)
            indexes.unshift(i)
        }
    }

    const spliceInput = splice.bind(input)
    for (const index of indexes)
        spliceInput(index, 1)

    return results
}

/*** Exports ***/

export default pluck
