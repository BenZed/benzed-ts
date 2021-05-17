import equals from '../equals'

/**
 * Returns the value-equal index of a given value in a given array-like.
 * 
 * ```typescript 
 * 
 * indexOf(
 *   [{ amount: 10 }, { amount: 20}, { amount: 30 }], 
 *   { amount: 20 }
 * ) // 1
 * 
 * ```
 * @param value 
 * @returns Numeric index, or -1 if none could be found.
 */
export default function indexOf<T>(
    arrayLike: ArrayLike<T>,
    value: T
): number {

    for (let i = 0; i < arrayLike.length; i++) {
        if (equals(arrayLike[i], value))
            return i
    }

    return -1
}
