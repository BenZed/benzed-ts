import indexOf from './index-of'

/**
 * Determine if array includes given value, checking via
 * value-equality.
 * 
 * ```typescript
 * includes([{foo:'bar'}], { foo: 'bar' }) // true
 * 
 * ```
 * 
 * @param arrayLike Arraylike to check.
 * @param value Value to check for.
 * @returns True if arraylike contains value, false if not.
 */
export default function includes<T>(
    arrayLike: ArrayLike<T>,
    value: T
): boolean {
    return indexOf(arrayLike, value) > -1
}