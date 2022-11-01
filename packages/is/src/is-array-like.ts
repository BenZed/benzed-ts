
/**
 * Is an input ArrayLike?
 * @param input 
 */
function isArrayLike<T>(input: unknown): input is ArrayLike<T> {

    return input !== null &&
        typeof input === `object` &&
        typeof (input as ArrayLike<T>).length === `number`
}

//// Exports ////

export default isArrayLike

export { isArrayLike }