
//// EsLint ////

import { Entries } from '@benzed/util/src/types'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

export enum KeyType {
    Key,
    Name,
    Symbol
}

export type SymbolsOf<T> = Extract<keyof T, symbol>

export type NamesOf<T> = Extract<keyof T, string>

export type KeysOf<T extends object, K extends KeyType = KeyType.Key> = K extends KeyType.Symbol 
    ? SymbolsOf<T>
    : K extends KeyType.Name 
        ? NamesOf<T> 
        : keyof T

export type ValuesOf<T extends object, K extends KeyType = KeyType.Key> = K extends KeyType.Symbol 
    ? SymbolsOf<T>
    : K extends KeyType.Name 
        ? NamesOf<T> 
        : keyof T

//// EachKey ////

export function eachKey<T extends object>(object: T): IterableIterator<KeysOf<T>>
export function eachKey<T extends object, K extends KeyType>(
    object: T, 
    options: { type: K, enumerable: boolean, own: boolean }
): IterableIterator<KeysOf<T>> 
export function * eachKey(
    object: object, 
    options: { type: KeyType, enumerable: boolean, own: boolean } = { type: KeyType.Key, enumerable: true, own: false }
): IterableIterator<PropertyKey> {
    for (const [key] of eachDescriptor(object, options))
        yield key
}

//// EachValue ////

export function eachValue<T extends object>(object: T): IterableIterator<ValuesOf<T>>
export function eachValue<T extends object, K extends KeyType>(
    object: T, 
    options: { type: K, enumerable: boolean, own: boolean }
): IterableIterator<ValuesOf<T, K>> 
export function * eachValue(
    object: object, 
    options: { type: KeyType, enumerable: boolean, own: boolean } = { type: KeyType.Key, enumerable: true, own: false }
): IterableIterator<unknown> {
    for (const [key] of eachDescriptor(object, options))
        yield object[key]
}

//// EachEntry ////

export function * eachEntry<T extends object>(
    object: T, 
    options: { type: KeyType, enumerable: boolean, own: boolean } = { type: KeyType.Key, enumerable: true, own: false }
): IterableIterator<Entries<T>> {
    for (const [key] of eachDescriptor(object, options))
        yield [key, object[key]] as Entries<T>
}

//// EachDescriptor ////

export function eachDescriptor<T extends object>(
    object: T
): IterableIterator<[PropertyKey, PropertyDescriptor]>
export function eachDescriptor<T extends object, K extends KeyType>(
    object: T, 
    options: { type: K, enumerable: boolean, own: boolean }
): IterableIterator<[KeysOf<T,K>, PropertyDescriptor]>
export function * eachDescriptor(
    object: object, 
    options: { type: KeyType, enumerable: boolean, own: boolean } = { type: KeyType.Key, enumerable: true, own: false }
): IterableIterator<[PropertyKey, PropertyDescriptor]> {

    type KeyDescriptor = IterableIterator<[PropertyKey, PropertyDescriptor]>

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

//// Helper ////

export function * eachObjectInPrototypeChain(object: object): IterableIterator<object> {

    let current = object
    while (current) {
        yield current
        current = Object.getPrototypeOf(current)
    }

}

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