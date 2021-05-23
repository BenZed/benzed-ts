
import { isArray } from './is-basic'

import isArrayLike from './is-array-like'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/prefer-readonly-parameter-types
*/

/*** Main ***/

/**
 * Creates a predicate that runs a given type guard
 * on every element in a given arraylike, ensuring its 
 * indexed values are of a given type.
 * @param predicate 
 * @returns 
 */
function everyItemInArrayLike<T>(
    predicate: (input: unknown) => input is T,
): (input: unknown) => input is ArrayLike<T> {

    return (input: unknown): input is ArrayLike<T> =>
        isArrayLike(input) &&
        input.length > 0 &&
        Array.prototype.every.call(input, predicate)
}

/**
 * Creates a predicate that runs a given type guard
 * on every element in a given array, ensuring its 
 * elements are of a given type.
 * @param predicate 
 * @returns 
 */
function everyItemInArray<T>(
    predicate: (input: unknown) => input is T,
): (input: unknown) => input is T[] {

    return (input: unknown): input is T[] =>
        isArray(input) &&
        input.length > 0 &&
        input.every(predicate)
}

/*** Exports ***/

export default everyItemInArray

export {
    everyItemInArrayLike,
    everyItemInArray
}