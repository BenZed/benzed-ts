/* eslint-disable @typescript-eslint/no-explicit-any */

import { $$copy, getKeys, isPrototypal, isReferable, Prototypal } from './util'

/*** Types ***/

type Refs = Readonly<WeakSet<any>>
interface Copyable<T> {
    [$$copy]: (this: Readonly<T>, refs?: Refs) => T
}

function isCopyable<T>(input: unknown): input is Copyable<T> {
    return input != null &&
        typeof (input as Copyable<T>)[$$copy] === 'function'
}

/*** Helper ***/

function hasCircularRef<T>(value: T, refs: Refs): boolean {
    const hasCircularReference = isReferable(value) && refs.has(value)
    return hasCircularReference
}

function copyWithoutCircularRef<T>(value: T, refs: Refs): T {

    if (hasCircularRef(value, refs))
        throw new Error('Cannot copy, circular reference deteced.')

    if (isReferable(value))
        refs.add(value)

    return copyWithImplementation(value, refs)
}

function copyObjectWithoutCircularRefs<T>(value: T, refs?: Refs): T {

    const clone = {} as any
    if (!refs)
        refs = new WeakSet<any>([value])

    for (const key of getKeys(value)) {
        if (!hasCircularRef(value[key], refs))
            clone[key] = copyWithoutCircularRef(value[key], refs)
    }

    return clone
}

function copyArrayWithoutCircularRefs<T>(value: readonly T[], refs?: Refs): T[] {

    const clone = new (value.constructor as ArrayConstructor)(value.length)
    if (!refs)
        refs = new WeakSet<any>([value])

    for (let i = 0; i < value.length; i++) {
        if (!hasCircularRef(value[i], refs))
            clone[i] = copyWithoutCircularRef(value[i], refs)
    }

    return clone
}

function copyWithImplementation<T>(value: T, refs?: Refs): T {

    if (value == null)
        return value

    if (isCopyable<T>(value))
        return value[$$copy](refs)

    if (!isPrototypal(value))
        return copyObjectWithoutCircularRefs(value, refs)

    throw new Error(
        `${value.constructor?.name || 'value'} does not implement Copyable<T>`
    )
}

/*** Standard Implementations ***/

function copyImmutable<T>(this: Readonly<T>): T {
    return this
}

function copyObject<T>(this: Readonly<T>, refs?: Refs): T {
    return copyObjectWithoutCircularRefs(this, refs)
}

function copyArray<T>(this: readonly T[], refs?: Refs): T[] {
    return copyArrayWithoutCircularRefs(this, refs)
}

function copyDate(this: Readonly<Date>): Date {
    return new Date(this.getTime())
}

function copySet<T>(this: Readonly<Set<T>>, refs?: Refs): Set<T> {

    const args: T[] = []

    for (const value of this.values())
        args.push(copyWithImplementation(value, refs))

    return new Set(args)
}

function copyMap<K, V>(this: Readonly<Map<K, V>>, refs?: Refs): Map<K, V> {

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