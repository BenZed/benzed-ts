
/**
 * Typesafe iteration of the keys of given object.
 */
export function * keysOf<T extends object> (object: T): Generator<keyof T> {
    for (const key in object)
        yield key
}
