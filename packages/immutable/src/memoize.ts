import { Func } from '@benzed/util'

import { ValueMap } from './value-map'

//// Helper ////

function trimCacheToSize(
    cache: ValueMap<unknown, unknown>,
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

//// Main ////

/**
 * Memoize a method by comparing it's arguments as value-equal.
 * @param method Method to memoize.
 * @param maxCacheSize Maximum number of argument variants to cache.
 * @returns Memoized method.
 */
function memoize<T extends Func>(
    method: T,
    maxCacheSize = Infinity
): T {

    const cache = new ValueMap<Parameters<T>, ReturnType<T>>()

    return ((...args: Parameters<T>): ReturnType<T> => {

        let result: ReturnType<T>
        if (cache.has(args))
            result = cache.get(args) as ReturnType<T>
        else {
            result = method(...args as unknown[]) as ReturnType<T>
            cache.set(args, result)

            trimCacheToSize(cache, maxCacheSize)
        }

        return result
    }) as T
}

//// Exports ////

export default memoize