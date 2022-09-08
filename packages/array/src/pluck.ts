/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Shortcuts ***/

const { splice } = Array.prototype

/*** Types ***/

type TypeGuardPredicate<T, F extends T> = (item: T, index: number, input: ArrayLike<T>) => item is F
type Predicate<T> = (item: T, index: number, input: ArrayLike<T>) => boolean

type OptionalPredicate<T, F extends T> =
    TypeGuardPredicate<T, F> |
    Predicate<T>

/*** Main ***/

/**
 * Removes a number of items from an array that pass a test.
 * 
 * ```typescript
 * const even = pluck([1, 2, 3, 4], v => v % 2 === 0) // [2,4], [1,3]
 * ```
 *
 * @param  {Array} input                 array to mutate
 * @param  {Function} predicate             predicate to run on each item
 * @param  {number} count = arr.length max number of items to remove. If this is a
 *                                     negative number, they'll be removed from the end
 *                                     of the array, rather than the beginning.
 * @return {Array}                     items removed via test
 */
function pluck<T, P extends OptionalPredicate<T, any>>(
    input: ArrayLike<T>,
    predicate: P,
    count = input.length
): P extends TypeGuardPredicate<any, infer U> ? U[] : T[] {

    const results: T[] = []
    const indexes: number[] = []

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
        if (!predicate(value, i, input))
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

    return results as P extends TypeGuardPredicate<any, infer F> ? F[] : T[]
}

/*** Exports ***/

export default pluck
