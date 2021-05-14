
/**
 * Unwraps an array if it is one.
 *
 * @param  {type} arr Object to unwrap.
 * @return {type}     If input is an array, returns the first value, otherwise
 *                    returns the input.
 */
function unwrap<T>(arr: T | T[]): T {
    return Array.isArray(arr)
        ? arr[0]
        : arr
}

/*** Exports ***/

export default unwrap
