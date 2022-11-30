import { defineName } from './define-name'
import { ValueMap, ValuesMap } from '../classes'
import { Func } from '../types'

// Helper 

function trimCacheToSize(
    cache: ValueMap<unknown[], unknown>,
    size: number
): void {

    const keys = cache['_keys']
    const values = cache['_values']

    if (cache.size > size) {
        const deleteCount = cache.size - size

        keys.splice(0, deleteCount)
        values.splice(0, deleteCount)
    }
}

function resolveOptions<F extends Func>(
    func: F, 
    options?: string | number | MemoizeOptions<F>
): Required<MemoizeOptions<F>> {

    const { 
        name = func.name,
        maxCacheSize = Infinity, 
        cache = new ValuesMap() as ValuesMap<Parameters<F>, ReturnType<F>>

    } = typeof options === 'string'
        ? { name: options }
        : typeof options === 'number'
            ? { maxCacheSize: options }
            : options ?? {}
    return {
        name,
        maxCacheSize,
        cache
    }
}

// Type 

export type Memoized<F extends Func> = F

export interface MemoizeOptions<F extends Func> {
    name?: string
    maxCacheSize?: number
    cache?: ValueMap<Parameters<F>, ReturnType<F>>
}

// Main

export function memoize<F extends Func>(f: F, name?: string): Memoized<F>

export function memoize<F extends Func>(f: F, maxCacheSize?: number): Memoized<F>

export function memoize<F extends Func>(f: F, options?: MemoizeOptions<F>): Memoized<F>

/**
 * get a method that caches it's output based in the identicality of it's arguments
 */
export function memoize<F extends Func>(
    func: F, 
    options?: string | number | MemoizeOptions<F>
): Memoized<F> {

    // Get Options
    const { name, cache, maxCacheSize } = resolveOptions(func, options)

    function memoized(this: unknown, ...args: Parameters<F> ): ReturnType<F> {

        // get memoized value
        if (cache.has(args)) 
            return cache.get(args) as ReturnType<F>

        // create memoized value
        const value = func.apply(this, args)
        cache.set(args, value)

        // trim cache
        if (cache instanceof ValueMap)
            trimCacheToSize(cache, maxCacheSize)

        return value as ReturnType<F>
    }

    return defineName(memoized, name) as Memoized<F>
}

//// Extend ////

memoize.options = resolveOptions