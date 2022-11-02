import { Compile, Func } from './types'
import { ValuesMap } from './structures'

//// Eslint ////

/* eslint-disable @typescript-eslint/no-explicit-any */

//// Types ////

type _Keys<T> = (keyof T)[]

//// Main ////

type _Pick<T extends object, TK extends _Keys<T>> = Compile<Pick<T, TK[number]>, void, false>
function _pick<T extends object, TK extends _Keys<T>>(input: T, ...keys: TK): _Pick<T, TK> {

    const output: Partial<T> = {}

    for (const key of keys)
        output[key] = input[key]

    return output as any
}

export function pick<T extends object, TK extends _Keys<T>>(...keys: TK): (input:T) => _Pick<T, TK>
export function pick<T extends object, TK extends _Keys<T>>(input: T, ...keys: TK): _Pick<T, TK>
export function pick(...input: any[]): any {
    if (typeof input[0] === 'object')
        return _pick(...input as [any])
    
    return (i: any) => _pick(i, ...input)
}

type _Omit<T extends object, TK extends _Keys<T>> = Compile<Omit<T, TK[number]>, void, false>
function _omit<T extends object, TK extends _Keys<T>>(input: T, ...keys: TK): _Omit<T, TK> {
    const output: Partial<T> = {}

    for (const key in input) {
        if (!keys.includes(key))
            output[key] = input[key]
    }

    return output as any
}
export function omit<T extends object, TK extends _Keys<T>>(...keys: TK): (input:T) => _Omit<T, TK>
export function omit<T extends object, TK extends _Keys<T>>(input: T, ...keys: TK): _Omit<T, TK> 
export function omit(...input: any[]): any {
    if (typeof input[0] === 'object')
        return _omit(...input as [any])

    return (i: any) => _omit(i, ...input)
}

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

/**
 * Does nothing, returns undefined
 */
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

/**
 * Call a map function with set arguments
 */
export const call = <F extends Func>(...p: Parameters<F>) => (f: F): ReturnType<F> => f(...p)