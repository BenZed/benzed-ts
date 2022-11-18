/* eslint-disable @typescript-eslint/no-explicit-any */

//// Type ////

type Last<T> = T extends readonly [...any, infer Ti]
    ? Ti
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
function last<T extends ArrayLike<any>>(
    arrayLike: T
): Last<T> {
    return arrayLike[arrayLike.length - 1] as Last<T>
}

//// Exports ////

export default last