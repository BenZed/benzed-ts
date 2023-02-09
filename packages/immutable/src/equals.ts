/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-this-alias */

import {
    isFunc, 
    isIterable, 
    isArrayLike, 
    isObject, 
    isShape, 
    AnyTypeGuard,
    GenericObject,
    keysOf, 
    indexesOf
} from '@benzed/util'

//// Symbols ////

const $$equals = Symbol('==')

//// Types ////

interface Comparable {
    [$$equals](right: unknown): right is this
}

const isComparable: (input: unknown) => input is Comparable = 
    isShape({
        [$$equals]: isFunc as AnyTypeGuard
    })

//// Helper ////

function equalArrayLikes(left: ArrayLike<unknown>, right: ArrayLike<unknown>): boolean {

    if (left.length !== right.length)
        return false

    for (const index of indexesOf(left)) {
        if (!equals(left[index], right[index]))
            return false
    }

    return true
}

function equalObject(left: GenericObject, right: GenericObject): boolean {

    const keys = new Set([
        ...keysOf(left), 
        ...keysOf(right)
    ])

    for (const key of keys) {
        if (!equals(left[key], right[key]))
            return false
    }

    return true
}

//// Main ////

function equals<T>(left: T, right: unknown): right is T {
    if (Object.is(left, right))
        return true

    const isLeftComparable = isComparable(left)
    if (isLeftComparable)
        return left[$$equals](right)

    const isRightComparable = isComparable(right)
    if (isRightComparable)
        return right[$$equals](left)

    if (!isObject(left) || !isObject(right))
        return false

    if (left.constructor !== right.constructor)
        return false 

    if (left instanceof WeakMap || left instanceof WeakSet)
        return false

    if (left instanceof RegExp || left instanceof Date)
        return left.toString() === right.toString()

    if (isArrayLike(left))
        return equalArrayLikes(left, right as typeof left)
    
    if (isIterable(left)) {
        return equalArrayLikes(
            [...left], 
            [...right as typeof left]
        )
    }

    return equalObject(left as GenericObject, right as GenericObject)
}

//// Exports ////

export default equals

export {
    equals,
    $$equals,
    Comparable,
    isComparable
}