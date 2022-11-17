/* eslint-disable @typescript-eslint/no-explicit-any */

//// Shortcuts ////

const { splice } = Array.prototype

//// Types ////

type TypeGuard<I, O extends I = I> = 
    (item: I, index: number, input: ArrayLike<I>) => 
        item is O

type Predicate<T> = (
    (item: T, index: number, input: ArrayLike<T>) => boolean
)

//// Main ////

/**
 * Removes a number of items from an array that pass a test.
 * 
 * ```typescript
 * const even = pluck([1, 2, 3, 4], v => v % 2 === 0) // [2,4], [1,3]
 * ```
 */
function pluck<I, O extends I>(
    input: ArrayLike<I>,
    typeguard: TypeGuard<I, O>,
    count?: number
): O[]

function pluck<T>(
    input: ArrayLike<T>,
    predicate: Predicate<T>,
    count?: number
): T[] 

function pluck(
    input: ArrayLike<unknown>,
    predicate: Predicate<unknown>,
    count = input.length
): unknown[] {

    const results: unknown[] = []
    const indexes: number[] = []

    const reverse = count < 0
    if (reverse)
        count = -count

    for (

        let i = reverse ? input.length - 1 : 0;

        results.length < count && (
            reverse
                ? i >= 0
                : i < input.length
        );

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

    return results
}

//// Exports ////

export default pluck
