/* eslint-disable @typescript-eslint/no-explicit-any */

import { isArray } from '@benzed/is'
import { assertDefined } from '@benzed/util'
import first from './first'

/*** Types ***/

type UnwrapIn = any | any[] | readonly any[]

type UnwrapOut<T> = T extends readonly [infer U, ...any]
    ? U
    : T extends Array<infer U>
    /**/ ? U | undefined
    /**/ : T extends Readonly<Array<infer U>>
        /**/ ? U
        /**/ : T

/*** Main ***/

/**
 * Unwraps an array if it is one.
 *
 * @param  {type} array Object to unwrap.
 * @return {type}     If input is an array, returns the first value, otherwise
 *                    returns the input.
 */
function unwrap<T extends UnwrapIn>(array: T): UnwrapOut<T> {
    return (isArray(array)
        ? first(array)
        : array) as UnwrapOut<T>
}

/*** Exports ***/

unwrap.assert = assertDefined(unwrap)

export default unwrap
