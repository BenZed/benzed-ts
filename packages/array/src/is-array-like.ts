
/**
 * Is an input ArrayLike?
 * @param input 
 */
function isArrayLike<T>(input: unknown): input is ArrayLike<T> {

    const arrayLike = input as null | ArrayLike<T>

    return arrayLike !== null &&
        typeof arrayLike === 'object' &&
        typeof arrayLike.length === 'number'
}

/***************************************************************/
// Exports
/***************************************************************/

export default isArrayLike