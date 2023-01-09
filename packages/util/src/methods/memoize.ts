import { NestedMap } from '../classes'
import { Property } from '../property'
import { isRecord, isString, keysOf } from '../types'
import { Func, isFunc } from '../types/func'

// Helper 

/**
 * Resolve memoize option arguments into a memoize options object
 */
function resolveOptions<F extends Func>(
    func: F, 
    options?: string | MemoizeOptions<F>
): Required<MemoizeOptions<F>> {

    const { 
        name = func.name,
        cache = new NestedMap() as NestedMap<Parameters<F>, ReturnType<F>>

    } = typeof options === 'string'
        ? { name: options }
        : options ?? {}
    return {
        name,
        cache
    }
}

// Type 

export type Memoized<F extends Func> = F

export interface MemoizeOptions<F extends Func> {
    name?: string
    cache?: NestedMap<Parameters<F>, ReturnType<F>>
}

// Main

export function memoize<R extends Record<string, Func>>(funcs: R): {
    [K in keyof R]: Memoized<R[K]>
}

export function memoize<F extends Func>(name: string, f: F): Memoized<F>

export function memoize<F extends Func>(f: F, name?: string): Memoized<F>

export function memoize<F extends Func>(f: F, options?: MemoizeOptions<F>): Memoized<F>

/**
 * get a method that caches it's output based in the identicality of it's arguments
 */
export function memoize(
    ...args: unknown[]
): unknown {

    // Memoize a record
    if (isRecord(args[0], isFunc)) {
        const output: Record<string, Func> = {}
        for (const key of keysOf(args[0]))
            output[key] = memoize(args[0][key], key)

        return output
    }

    const [func, options] = (isString(args[0]) ? [args[1], args[0]] : args) as [Func, string | MemoizeOptions<Func>]

    // Get Options
    const { name, cache } = resolveOptions(func, options)

    function memoized(this: unknown, ...args: Parameters<Func> ): ReturnType<Func> {

        // get memoized value
        if (cache.has(args)) 
            return cache.get(args)

        // create memoized value
        const value = func.apply(this, args)
        cache.set(args, value)

        return value
    }

    return Property.name(memoized, name)
}

//// Extend ////

memoize.options = resolveOptions