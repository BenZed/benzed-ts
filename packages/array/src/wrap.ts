/******************************************************************************/
// Main
/******************************************************************************/

/**
 * Wraps an input in an Array, if it isn't an array already.
 *
 * @param  {type} arr Object to wrap.
 * @return {type}     If input is an array, returns the input, otherwise returns
 *                    an array with the input as the first value.
 */
function wrap<T>(this: T | T[], arr: T | T[]): T[] {

    if (this !== undefined)
        arr = this

    return Array.isArray(arr)
        ? arr
        : [arr]
}


/******************************************************************************/
// Exports
/******************************************************************************/

export default wrap

