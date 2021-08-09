/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-this-alias */

import { $$equals, getKeys, isReferable, Prototypal } from './util'
import { isIterable, isArrayLike } from '@benzed/is'

/*** Types ***/

interface Comparable {
    [$$equals]: (this: Readonly<Comparable>, right: unknown) => boolean
}

function isComparable(input: unknown): input is Comparable {
    return input != null &&
        typeof (input as Comparable)[$$equals] === 'function'
}

/*** Helper ***/

function compareWithImplementation<T>(left: T, right: unknown): boolean {

    if (left == null || right == null || Object.is(left, right))
        return Object.is(left, right)

    const isLeftComparable = isComparable(left)
    if (isLeftComparable && (left as any)[$$equals](right))
        return true

    if (isComparable(right)) {
        const hasDifferingImplementation =
            !isLeftComparable ||
            (left as any)[$$equals] !== right[$$equals]

        if (hasDifferingImplementation && right[$$equals](left))
            return true
    }

    return false
}

function compareArrayLikes<T>(left: ArrayLike<T>, right: ArrayLike<T>): boolean {

    if (left.length !== right.length)
        return false

    for (let i = 0; i < left.length; i++) {
        if (!compareWithImplementation(left[i], right[i]))
            return false
    }

    return true
}

/*** Standard Implementations ***/

function equalIs<T>(this: T, right: unknown): boolean {
    const left = this
    return Object.is(left, right)
}

function equalIterable<T extends Iterable<U>, U>(this: Readonly<T>, right: unknown): boolean {
    const left = this

    if (!isIterable(right))
        return false

    return compareArrayLikes(
        [...left as T],
        [...right]
    )
}

function equalArrayLike<T>(this: readonly T[], right: unknown): boolean {
    const left = this

    if (!isArrayLike(right))
        return false

    return compareArrayLikes(left, right)
}

function equalObject<T>(this: T, right: unknown): boolean {

    if (typeof right !== 'object' || right === null)
        return false

    const left = this

    const leftKeys = getKeys(left)
    const rightKeys = getKeys(right)

    if (leftKeys.length !== rightKeys.length)
        return false

    for (const key of leftKeys) {
        if (!compareWithImplementation(left[key], (right as any)[key]))
            return false
    }

    return true
}

function equalDate(this: Readonly<Date>, right: unknown): boolean {
    const left = this

    return isReferable(right) &&
        typeof right.getTime === 'function' &&
        left.getTime() === right.getTime()
}

function equalRegExp(this: Readonly<RegExp>, right: unknown): boolean {
    const left = this

    return right instanceof RegExp && left.toString() === right.toString()
}

/*** Add Standard Implementations ***/

{

    const addToPrototype = (
        { prototype }: Readonly<Prototypal>,
        implementation: Comparable[typeof $$equals]
    ): void => {

        Object.defineProperty(prototype, $$equals, {
            value: implementation,
            writable: true
        })
    }

    for (const Immutable of [String, Boolean, Number, Symbol, Function])
        addToPrototype(Immutable, equalIs)

    for (const Iterable of [Map, Set])
        addToPrototype(Iterable, equalIterable as any)

    addToPrototype(Object, equalObject)
    addToPrototype(RegExp, equalRegExp as any)
    addToPrototype(Date, equalDate as any)

    for (const ArrayType of [
        Array,
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
        addToPrototype(ArrayType, equalArrayLike as any)
}

/*** Main ***/

function equals<T>(a: T, b: unknown): b is T {
    return compareWithImplementation(a, b)
}

/*** Exports ***/

export default equals

export {
    equals,
    Comparable,
    isComparable
}