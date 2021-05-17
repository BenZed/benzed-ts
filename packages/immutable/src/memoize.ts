import ValueMap from './value-map'

/*** Helper ***/

function trimCacheToSize(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    cache: ValueMap<unknown, unknown>,
    size: number
): void {

    const keys = cache['_keys']
    const values = cache['_values']

    if (cache.size > size) {
        keys.splice(0, keys.length - size)
        values.splice(0, values.length - size)
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
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
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