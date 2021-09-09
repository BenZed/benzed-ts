import ValueMap from './value-map'

/*** Helper ***/

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

/*** Main ***/

/**
 * Memoize a method by comparing it's arguments as value-equal.
 * @param method Method to memoize.
 * @param maxCacheSize Maximum number of argument variants to cache.
 * @returns Memoized method.
 */
function memoize<K extends unknown[], V>(
    method: (...args: K) => V,
    maxCacheSize = Infinity
): typeof method {

    const cache = new ValueMap<K, V>()

    return (...args: K): V => {

        let result: V
        if (cache.has(args))
            result = cache.get(args) as V
        else {
            result = method(...args)
            cache.set(args, result)

            trimCacheToSize(cache, maxCacheSize)
        }

        return result
    }
}

/*** Exports ***/

export default memoize