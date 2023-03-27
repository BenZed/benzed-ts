
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Type ////

type First<T> = T extends readonly [infer F, ...any]
    ? F
    : T extends Array<infer Ti>
    /**/ ? Ti | undefined
        /**/ : T extends string
            /**/ ? string
            /**/ : T extends ArrayLike<infer Ti>
                /**/ ? Ti | undefined
                /**/ : T

//// Main ////

/**
 * Returns the first element of an ArrayLike.
 * @param arrayLike 
 */
function first<T extends ArrayLike<unknown>>(
    arrayLike: T
): First<T> {
    return arrayLike[0] as First<T>
}

//// Exports ////

export { first }