
/**
 * Is an input Iterable?
 * @param input 
 */
function isIterable<T>(input: unknown): input is Iterable<T> {

    return typeof input === 'string' ||
        typeof input === 'object' &&
        input !== null &&
        Symbol.iterator in input
}

/***************************************************************/
// Exports
/***************************************************************/

export default isIterable