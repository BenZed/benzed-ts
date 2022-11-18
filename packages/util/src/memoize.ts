import { ValuesMap } from './structures'
import { Func } from './types'

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