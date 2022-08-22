/* eslint-disable @typescript-eslint/no-explicit-any */

import { isArray } from '@benzed/is'

/*** Types ***/

type WrapIn = any | any[] | readonly any[]

type WrapOut<T> = T extends any[] | readonly any[]
    ? T
    : T[]

/*** Main ***/

/**
 * Wraps an input in an Array, if it isn't an array already.
 *
 * @param  {type} value Object to wrap.
 * @return {type}       If input is an array, returns the input, otherwise returns
 *                      an array with the input as the first value.
 */
function wrap<T extends WrapIn>(
    value: T
): WrapOut<T> {
    return (isArray(value) ? value : [value]) as WrapOut<T>
}

/*** Exports ***/

export default wrap

