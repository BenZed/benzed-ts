
const { indexOf, splice } = Array.prototype

//// Main ////

/**
 * Removes all values equal to input in an array-like.
 */
function remove<T>(input: ArrayLike<T>, value: T): ArrayLike<T> 
function remove<T>(this: ArrayLike<T>, value: T): ArrayLike<T> 

function remove(this: unknown, ...args: [ArrayLike<unknown>, unknown] | [unknown]): ArrayLike<unknown> {

    const [ input, value ] = (args.length < 2 ? [this, ...args] : args) as [ArrayLike<unknown>, unknown]

    const inputIndexOf = indexOf.bind(input)
    const inputSplice = splice.bind(input)
    let index: number

    do {

        index = inputIndexOf(value)
        if (index > -1)
            inputSplice(index, 1)

    } while (index >= 0)

    return input

}

//// Exports ////

export default remove
