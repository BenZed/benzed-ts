import { isObject } from '../types/guards'

//// Implementation ////

/**
 * get a memoized method that returns the given input
 */
export function returns<T>(input: T): () => T {

    const cache = isObject(input) 
        ? returns.cache.objects 
        : returns.cache.primitives

    const value = input as object

    if (!cache.has(value))
        cache.set(value, () => input)

    return cache.get(value)
}

returns.cache = {
    objects: new WeakMap(),
    primitives: new Map()
}

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
