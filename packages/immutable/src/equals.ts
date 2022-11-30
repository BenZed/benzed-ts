/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-this-alias */

import { keysOf, isFunction, isIterable, isArrayLike, isObject } from '@benzed/util'

import { $$equals } from './symbols'
import { isReferable, Prototypal } from './util'

//// Types ////

interface Comparable {
    [$$equals]: (right: unknown) => right is this
}

function isComparable(input: unknown): input is Comparable {
    return isFunction((input as Comparable)[$$equals])
}

//// Helper ////

function compareWithImplementation(left: unknown, right: unknown): boolean {

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

function compareArrayLikes(left: ArrayLike<unknown>, right: ArrayLike<unknown>): boolean {

    if (left.length !== right.length)
        return false

    for (let i = 0; i < left.length; i++) {
        if (!compareWithImplementation(left[i], right[i]))
            return false
    }

    return true
}

//// Standard Implementations ////

function equalIs<T>(this: T, right: unknown): right is T {
    const left = this
    return Object.is(left, right)
}

function equalIterable<T extends Iterable<U>, U>(this: T, right: unknown): right is T {
    const left = this

    if (!isIterable(right))
        return false

    return compareArrayLikes(
        [...left as T],
        [...right]
    )
}

function equalArrayLike<T extends ArrayLike<any>>(this: T, right: unknown): right is T {
    const left = this

    if (!isArrayLike(right))
        return false

    return compareArrayLikes(left, right)
}

function equalObject<T extends object>(this: T, right: unknown): right is T {

    if (!isObject(right))
        return false

    const left = this

    const leftKeys = [...keysOf(left)]
    const rightKeys = [...keysOf(right)]

    if (leftKeys.length !== rightKeys.length)
        return false

    for (const key of leftKeys) {
        if (!compareWithImplementation(left[key], (right as any)[key]))
            return false
    }

    return true
}

function equalDate(this: Date, right: unknown): right is Date {
    const left = this

    return isReferable(right) &&
        isFunction(right.getTime) &&
        left.getTime() === right.getTime()
}

function equalRegExp(this: RegExp, right: unknown): right is RegExp {
    const left = this

    return right instanceof RegExp && left.toString() === right.toString()
}

//// Add Standard Implementations ////

{

    const addToPrototype = (
        { prototype }: Prototypal,
        implementation: (right: unknown) => boolean
    ): void => {

        Object.defineProperty(prototype, $$equals, {
            value: implementation,
            writable: true
        })
    }

    for (const Immutable of [String, Boolean, Number, Symbol, Function])
        addToPrototype(Immutable, equalIs)

    for (const Iterable of [Map, Set])
        addToPrototype(Iterable, equalIterable)

    addToPrototype(Object, equalObject)
    addToPrototype(RegExp, equalRegExp)
    addToPrototype(Date, equalDate)

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
        addToPrototype(ArrayType, equalArrayLike)
}

//// Main ////

function equals<T>(a: T, b: unknown): b is T {
    return compareWithImplementation(a, b)
}

//// Exports ////

export default equals

export {
    equals,
    Comparable,
    isComparable
}