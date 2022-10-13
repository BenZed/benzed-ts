import { Func } from './types'
import { ValuesMap } from './value-map'

/**
 * get a method that caches it's output based in the identicality of it's arguments
 */
export function memoize<T extends Func>(func: T): T {

    return ((...args: Parameters<T> ): ReturnType<T> => {

        if (memoize.cache.has(args)) 
            return memoize.cache.get(args)

        const value = func(...args as unknown[])
        if (value instanceof Promise)
            value.then(result => memoize.cache.set(args, result))

        memoize.cache.set(args, value)

        return value as ReturnType<T>
    }) as T
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
memoize.cache = new ValuesMap<any,any>()

/**
 * get a memoized method that returns this given input
 */
export function returns<T>(value: T): () => T {
    if (!returns.cache.has(value))
        returns.cache.set(value, () => value)

    return returns.cache.get(value)
}
returns.cache = new Map()

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

export const toVoid = returns(undefined) as () => void

export const noop = returns(undefined) as () => void

export const toUndefined = returns(undefined)

export const toNull = returns(null)

/**
 * input to output
 */
export const through = <T>(i:T): T => i
export {
    through as io,
    through as inputToOutput
}