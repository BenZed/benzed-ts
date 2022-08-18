/* eslint-disable @typescript-eslint/no-explicit-any */

import { assertDefined } from '@benzed/util'

/*** Type ***/

type First<T> = T extends readonly [infer U, ...any]
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
): First<T> {
    return arrayLike[0] as First<T>
}

/*** Exports ***/

first.assert = assertDefined(first)

export default first