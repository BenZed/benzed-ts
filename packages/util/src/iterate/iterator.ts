
//// Types ////

type Input = unknown[]

type Yeild<T extends Input> = any

//// Exports ////

// Write tests for the following code:

/**
 * Iterate through any number of items.
 * If any of these items is iterable, they will
 * be iterated through, as well.
 */
export function iterate<T>(...items: T[]): Iterator<T> {

}