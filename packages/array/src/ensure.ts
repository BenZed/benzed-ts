
//// Shortcuts ////

const { indexOf, push } = Array.prototype

//// Main ////

/**
 * If a value exists does not exist in an arraylike collection, it
 * adds it to the collection. Otherwise, it does nothing.
 *
 * ```typescript
 * ensure([1], 1) // [1]
 * ensure([1], 2) // [1, 2]
 * ```
 *
 * @param arrayLike Collection
 * @param value Value to ensure
 */
function ensure<T>(input: ArrayLike<T>, value: T): ArrayLike<T> 
function ensure<T>(this: ArrayLike<T>, value: T): ArrayLike<T> 

function ensure(this: unknown, ...args: [ArrayLike<unknown>, unknown] | [unknown]): ArrayLike<unknown> {

    const [ input, value ] = (args.length < 2 ? [this, ...args] : args) as [ArrayLike<unknown>, unknown]

    const index = indexOf.call(input, value)
    if (index === -1)
        push.call(input, value)

    return input
}

//// Exports ////

export { ensure }