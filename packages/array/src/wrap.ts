
import { is } from '@benzed/is'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type Wrap<T> = T extends any[] | readonly any[]
    ? T
    : T[]

//// Main ////

/**
 * Wraps an input in an Array, if it isn't an array already.
 *
 * @param  {type} value Object to wrap.
 * @return {type}       If input is an array, returns the input, otherwise returns
 *                      an array with the input as the first value.
 */
function wrap<T>(
    value: T
): Wrap<T> {
    return (is.array(value) ? value : [value]) as Wrap<T>
}

//// Exports ////

export default wrap

