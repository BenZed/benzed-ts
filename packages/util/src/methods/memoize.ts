import { ReferenceMap } from '../classes'
import { property } from '../property'
import { Func } from '../types/func'

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
        cache = new ReferenceMap() as ReferenceMap<Parameters<F>, ReturnType<F>>

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
    cache?: ReferenceMap<Parameters<F>, ReturnType<F>>
}

// Main

export function memoize<F extends Func>(f: F, name?: string): Memoized<F>

export function memoize<F extends Func>(f: F, options?: MemoizeOptions<F>): Memoized<F>

/**
 * get a method that caches it's output based in the identicality of it's arguments
 */
export function memoize<F extends Func>(
    func: F, 
    options?: string | MemoizeOptions<F>
): Memoized<F> {

    // Get Options
    const { name, cache } = resolveOptions(func, options)

    function memoized(this: unknown, ...args: Parameters<F> ): ReturnType<F> {

        // get memoized value
        if (cache.has(args)) 
            return cache.get(args) as ReturnType<F>

        // create memoized value
        const value = func.apply(this, args)
        cache.set(args, value)

        return value as ReturnType<F>
    }

    return property.name(memoized, name) as Memoized<F>
}

//// Extend ////

memoize.options = resolveOptions