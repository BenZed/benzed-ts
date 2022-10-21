
/*** Helper ***/

function isIterable<T>(input: unknown): input is Iterable<T> {

    const type = typeof input

    return type === `string` ||

        type === `object` &&
        input !== null &&
        typeof (input as Iterable<T>)[Symbol.iterator] === `function`

}

/*** Main ***/

/**
 * Iterate through generic collections
 */
function* iterate<T>(
    input:
    /**/ ArrayLike<T> |
    /**/ Iterable<T> |
    /**/ Record<string | number, T>

): Generator<T> {

    if (typeof input === `string` || `length` in input) {

        // ArrayLike<T>
        for (let i = 0; i < input.length; i++)
            yield input[i]

    } else if (isIterable(input)) {

        // Iterable<T>
        for (const value of input as Iterable<T>)
            yield value

    } else {

        // Record<string | number, T>
        for (const key in input)
            yield input[key]

    }
}

/*** Exports ***/

export default iterate

export {
    iterate,
    isIterable
}