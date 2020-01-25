/******************************************************************************/
// Main
/******************************************************************************/

/**
 * Wraps an input in an Array, if it isn't an array already.
 *
 * @param  {type} value Object to wrap.
 * @return {type}     If input is an array, returns the input, otherwise returns
 *                    an array with the input as the first value.
 */
function wrap<T>(value: T | T[]): T[] {

    return Array.isArray(value)
        ? value
        : [value]
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default wrap

