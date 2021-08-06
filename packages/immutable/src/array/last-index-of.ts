import equals from '../equals'

/**
 * Returns the last value-equal index of a given value in a given array-like.
 * 
 * ```typescript 
 * 
 * lastIndexOf(
 *   [{ amount: 10 }, { amount: 20}, { amount: 30 }], 
 *   { amount: 20 }
 * ) // 1
 * 
 * ```
 * @param value 
 * @returns Numeric index, or -1 if none could be found.
 */
export default function lastIndexOf<T>(
    arrayLike: ArrayLike<T>,
    value: T
): number {

    for (let i = arrayLike.length - 1; i >= 0; i--) {
        if (equals(arrayLike[i], value))
            return i
    }

    return -1
}

export { lastIndexOf }