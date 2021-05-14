import isArrayLike from './is-array-like'

/*** Shortcuts ***/

const { push } = Array.prototype

/*** Main ***/

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

/*** Export ***/

export default flatten
