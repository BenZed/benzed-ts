
//// Implementation ////

/**
 * get a memoized method that returns the given input
 */
export function returns<T>(value: T): () => T {
    if (!returns.cache.has(value))
        returns.cache.set(value, () => value)

    return returns.cache.get(value)
}
returns.cache = new Map()

//// Shortcuts ////

/**
 * Returns true
 */
export const pass = returns(true)
export const toTrue = returns(true)

/**
 * returns false
 */
export const fail = returns(false)
export const toFalse = returns(false)

/**
 * Does nothing, returns undefined
 */
export const noop = returns(undefined) as () => void
export const toVoid = returns(undefined) as () => void
export const toUndefined = returns(undefined)

export const toNull = returns(null)

/**
 * input to output
 */
export const through = <T>(i: T): T => i
export {
    through as io,
    through as inputToOutput
}
