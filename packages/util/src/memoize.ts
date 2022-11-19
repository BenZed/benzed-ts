import { ValuesMap } from './structures'

/**
 * get a method that caches it's output based in the identicality of it's arguments
 */
export function memoize<A extends unknown[], R>(func: (...args: A) => R): (...args: A) => R {

    return (...args: A ): R => {

        if (memoize.cache.has(args)) 
            return memoize.cache.get(args) as R

        const value = func(...args as A)
        if (value instanceof Promise)
            value.then(result => memoize.cache.set(args, result))

        memoize.cache.set(args, value)

        return value as R
    }
}

memoize.cache = new ValuesMap<unknown[],unknown>()