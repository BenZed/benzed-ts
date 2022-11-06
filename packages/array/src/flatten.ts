import { isArrayLike } from '@benzed/is'

//// Shortcuts ////

const { push } = Array.prototype

//// Main ////

/**
 * Unwraps all nested arrays into a single array.
 * @returns the flattened array
 */
function flatten<T>(input: ArrayLike<T>): T[] {

    const output: T[] = []

    for (let i = 0; i < input.length; i++) {
        const item = input[i]
        if (isArrayLike(item))
            push.apply(output, flatten(item))
        else
            output.push(item)
    }

    return output
}

//// Export ////

export default flatten
