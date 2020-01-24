
/**
 * Unwraps an array.
 *
 * @param  {type} arr Object to unwrap.
 * @return {type}     If input is an array, returns the first value, otherwise
 *                    returns the input.
 */
function unwrap<T>(this: T | T[], arr: T | T[]): T {

    if (this !== undefined)
        arr = this

    return Array.isArray(arr)
        ? arr[0]
        : arr
}

/******************************************************************************/
// Exports
/******************************************************************************/

export default unwrap
