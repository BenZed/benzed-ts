/* eslint-disable @typescript-eslint/no-explicit-any */

import { nil, TypeGuard } from '@benzed/util'

//// Shortcuts ////

const { splice } = Array.prototype

//// Types ////

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
    typeguard: TypeGuard<O, I>,
    count?: number
): O[]

function pluck<T>(
    input: ArrayLike<T>,
    predicate: Predicate<T>,
    count?: number
): T[]

function pluck<T>(
    this: ArrayLike<T>,
    predicate: Predicate<T>,
    count?: number
): T[]

function pluck(
    this: unknown,
    ...args: unknown[]
): unknown[] {

    const [ input, predicate, maxToRemove ] = (args.length <= 1 ? [this, ...args] : args) as [ArrayLike<unknown>, Predicate<unknown>, number | nil ]

    let count = maxToRemove ?? input.length

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
