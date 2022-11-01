
//// Shortcuts ////

const { findIndex } = Array.prototype

//// Type ////

type Predicate<T> = (value: T, index: number, array: ArrayLike<T>) => boolean

//// Main ////

/**
 * Execute findIndex with multiple predicates. Subsequent
 * predicates will be called if the previous fails 
 * to retreive an index.
 */
function priorityFindIndex<T>(
    input: ArrayLike<T>,
    ...predicates: Predicate<T>[]
): number {

    const inputFindIndex = findIndex.bind(input)

    for (const predicate of predicates) {
        const index = inputFindIndex(predicate)
        if (index >= 0)
            return index
    }

    return -1
}

/**
 * Execute find with multiple predicates. Subsequent
 * predicates will be called if the previous fails.
 */
function priorityFind<T>(
    input: ArrayLike<T>,
    ...predicates: Predicate<T>[]
): T | undefined {

    const index = priorityFindIndex(input, ...predicates)

    return index >= 0
        ? input[index]
        : undefined
}

//// Exports ////

export default priorityFind

export {
    priorityFind,
    priorityFindIndex
}