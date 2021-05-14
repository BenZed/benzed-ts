
/**
 * Is an input Iterable?
 * @param input 
 */
function isIterable<T>(input: unknown): input is Iterable<T> {

    return !!input && typeof (input as Iterable<T>)[Symbol.iterator] === 'function'
}

/*** Exports ***/

export default isIterable