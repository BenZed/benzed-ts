
//// EsLint ////

import { Descriptor } from '../property-v2'
import { Entries } from '../types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

export enum KeyType {
    Key,
    Name,
    Symbol
}

export type YieldKey<T extends object> = KeyType extends KeyType.Symbol 
    ? Extract<keyof T, symbol>
    : KeyType extends KeyType.Name 
        ? Extract<keyof T, string>
        : keyof T

export type YieldValue<T extends object> = KeyType extends KeyType.Symbol 
    ? Extract<keyof T, symbol>
    : KeyType extends KeyType.Name 
        ? Extract<keyof T, string>
        : keyof T

//// Methods ////

export function * eachKey<T extends object, K extends KeyType>(
    object: T, 
    options: { type: K, enumerable: boolean, own: boolean }
): IterableIterator<YieldKey<T>> {
    for (const [key] of eachDescriptor(object, options))
        yield key
}

export function * eachValue<T extends object, K extends KeyType>(
    object: T, 
    options: { type: K, enumerable: boolean, own: boolean }
): IterableIterator<T[keyof T]> {
    for (const [key] of eachDescriptor(object, options))
        yield object[key]
}

export function * eachEntry<T extends object, K extends KeyType>(
    object: T, 
    options: { type: K, enumerable: boolean, own: boolean }
): IterableIterator<Entries<T>> {
    for (const [key] of eachDescriptor(object, options))
        yield [key, object[key]] as Entries<T>
}

export function * eachDescriptor<T extends object>(
    object: T, 
    options: { type: KeyType, enumerable: boolean, own: boolean }
): IterableIterator<[YieldKey<T>, Descriptor]> {

    type KeyDescriptor = IterableIterator<[YieldKey<T>, Descriptor]>

    const includeSymbols = options.type !== KeyType.Name
    const includeNames = options.type !== KeyType.Symbol
    const includeNonEnumerable = !options.enumerable 
    const includeInherited = !options.own 

    const iteratedKeys: Set<string | symbol> = new Set()

    for (const current of eachObjectInPrototypeChain(object)) {
        if (current === Object.prototype)
            break

        const descriptors = Object.getOwnPropertyDescriptors(current)

        if (includeNames) {
            const names = Object.getOwnPropertyNames(descriptors)
            yield* eachKeyInDescriptorMap(descriptors, names, includeNonEnumerable, iteratedKeys) as KeyDescriptor
        }
        
        if (includeSymbols) {
            const symbols = Object.getOwnPropertySymbols(descriptors)
            yield* eachKeyInDescriptorMap(descriptors, symbols, includeNonEnumerable, iteratedKeys) as KeyDescriptor
        }

        if (!includeInherited)
            break
    }
}

export function * eachObjectInPrototypeChain(object: object): IterableIterator<object> {

    let current = object
    while (current) {
        yield current
        current = Object.getPrototypeOf(current)
    }

}

//// Helper ////

function * eachKeyInDescriptorMap(
    descriptors: PropertyDescriptorMap, 
    keys: (string | symbol)[], 
    includeNonEnumerable: boolean,
    iteratedKeys: Set<string | symbol>
) {

    for (const key of keys) {

        // don't iterate the same key twice.
        if (iteratedKeys.has(key))
            continue 

        const descriptor = descriptors[key]
        if (!descriptor.enumerable && !includeNonEnumerable)
            continue 

        iteratedKeys.add(key) 
        yield [key, descriptor]
    }
}