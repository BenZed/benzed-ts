/* eslint-disable @typescript-eslint/no-explicit-any */

import { assertDefined } from '@benzed/util'

/*** Type ***/

type Last<T> = T extends readonly [...any, infer U]
    ? U
    : T extends Array<infer U>
    /**/ ? U | undefined
    /**/ : T extends Readonly<Array<infer U>>
        /**/ ? U
        /**/ : T extends string
            /**/ ? string
            /**/ : T extends ArrayLike<infer U>
                /**/ ? U | undefined
                /**/ : T

/*** Main ***/

/**
 * Returns the first element of an ArrayLike.
 * @param arrayLike 
 */
function first<T extends ArrayLike<any>>(
    arrayLike: T
): Last<T> {
    return arrayLike[arrayLike.length - 1] as Last<T>
}

/*** Exports ***/

first.assert = assertDefined(first)

export default first