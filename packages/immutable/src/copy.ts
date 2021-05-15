/* eslint-disable @typescript-eslint/no-explicit-any */

import { $$copy } from './symbols'

/*** Types ***/

type ReferenceMap = Readonly<WeakMap<any, any>>

type Prototypal = { prototype: unknown }

function isPrototypal(input: unknown): input is Prototypal {
    return Object.getPrototypeOf(input) !== null
}

interface Copyable<T> {
    [$$copy]: (this: Readonly<T>, refs?: ReferenceMap) => T
}

function isCopyable<T>(input: unknown): input is Copyable<T> {
    return input != null &&
        typeof (input as Copyable<T>)[$$copy] === 'function'
}

/*** Helper ***/

function resolveCircularRef<T>(value: T, refs: ReferenceMap): T {

    const isObject = value !== null && typeof value === 'object'
    const hasCircularReference = isObject && refs.has(value)

    const clone = hasCircularReference
        ? refs.get(value)
        : copyWithImplementation(value, refs)

    if (isObject && !hasCircularReference)
        refs.set(value, clone)

    return clone

}

function copyObjectConsideringCircularRefs<T>(value: T, refs?: ReferenceMap): T {

    const clone = {} as any
    if (!refs)
        refs = new WeakMap([[value, clone]] as any)

    const keys = Object.getOwnPropertyNames(value)
    for (const key of keys)
        clone[key] = resolveCircularRef((value as any)[key], refs)

    return clone
}

function copyArrayConsideringCircularRefs<T>(value: readonly T[], refs?: ReferenceMap): T[] {

    const clone = new (value.constructor as ArrayConstructor)(value.length)
    if (!refs)
        refs = new WeakMap([[value, clone]])

    for (let i = 0; i < value.length; i++)
        clone[i] = resolveCircularRef(value[i], refs)

    return clone
}

function copyWithImplementation<T>(value: T, refs?: ReferenceMap): T {

    if (refs?.has(value))
        return refs.get(value) as T

    if (value == null)
        return value

    if (isCopyable<T>(value))
        return value[$$copy](refs)

    if (!isPrototypal(value))
        return copyObjectConsideringCircularRefs(value, refs)

    throw new Error(
        `${value.constructor?.name || 'value'} does not implement $$copy trait.`
    )
}

/*** Standard Implementations ***/

function copyImmutable<T>(this: Readonly<T>): T {
    return this
}

function copyObject<T>(this: Readonly<T>, refs?: ReferenceMap): T {
    return copyObjectConsideringCircularRefs(this, refs)
}

function copyArray<T>(this: readonly T[], refs?: ReferenceMap): T[] {
    return copyArrayConsideringCircularRefs(this, refs)
}

function copyDate(this: Readonly<Date>): Date {
    return new Date(this.getTime())
}

function copySet<T>(this: Readonly<Set<T>>, refs?: ReferenceMap): Set<T> {

    const args: T[] = []

    for (const value of this.values())
        args.push(copyWithImplementation(value, refs))

    return new Set(args)
}

function copyMap<K, V>(this: Readonly<Map<K, V>>, refs?: ReferenceMap): Map<K, V> {

    const args: [K, V][] = []

    for (const value of this.entries())
        args.push(copyWithImplementation(value, refs))

    return new Map(args)

}

/*** Add Standard Implementations ***/
{

    const addToPrototype = <T>(
        { prototype }: Readonly<Prototypal>,
        implementation: Copyable<T>[typeof $$copy]
    ): void => {

        Object.defineProperty(prototype, $$copy, {
            value: implementation,
            writable: true
        })
    }

    for (const Immutable of [String, Number, Boolean, RegExp, Symbol, Function])
        addToPrototype(Immutable, copyImmutable)

    for (const WeakCollection of [WeakSet, WeakMap])
        addToPrototype(WeakCollection, copyImmutable)
    // ^ obviously they're not immutable, but the a weak collection can't be
    // copied as it's contents can't be iterated

    addToPrototype<Set<any>>(Set, copySet)
    addToPrototype<Map<any, any>>(Map, copyMap)
    addToPrototype(Object, copyObject)
    addToPrototype(Date, copyDate)

    if (typeof Buffer !== 'undefined') {
        addToPrototype(Buffer, function (this: Readonly<Buffer>): Buffer {
            return Buffer.from(this)
        })
    }

    for (const ArrayType of [
        // fun fact, copyObject actually works with the standard array type,
        // but the copyArray implementation we have here is much faster
        Array,

        // the rest of the typed arrays, however, break using copyObject, so
        // they need the copyArray implementation
        Int8Array,
        Uint8Array,
        Uint8ClampedArray,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array
    ])
        addToPrototype<any[]>(ArrayType, copyArray)

}

// Create copy interface 

/**
 * Creates a data duplicate of a given value, ignoring
 * circular references.
 */
function copy<T>(value: T): T {
    return copyWithImplementation(value)
}

/*** Exports ***/

export default copy

export {
    copy,
    Copyable,
    isCopyable
}