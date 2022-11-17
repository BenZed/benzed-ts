import { merge } from '@benzed/util'

import {
    isString,
    isBoolean,
    isSymbol,
    isNaN,
    isObject,
    isFunction,
    isTruthy,
    isFalsy,
    isNumber,
    isBigInt,
    isDefined,
    isArray,
    isSortable,
    isPromise,
    isDate,
    isPrimitive,
} from './is-basic'

import arrayOf, {
    isArrayOfArray,
    isArrayOfArrayLike,
    isArrayOfBigInt,
    isArrayOfBoolean,
    isArrayOfFunction,
    isArrayOfIterable,
    isArrayOfNumber,
    isArrayOfObject,
    isArrayOfString,
    isArrayOfSymbol,
    isArrayOfInt,
    isArrayOfPlainObject,
    isArrayOfSortable,
    isArrayOfPromise,
    isArrayOfTruthy,
    isArrayOfFalsy,
    isArrayOfDefined,
    isArrayOfDate,
    isArrayOfNaN
} from './is-array-of'

import {
    isEven,
    isInteger,
    isMultipleOf,
    isNegative,
    isOdd,
    isPositive
} from './is-math'

import isIterable from './is-iterable'
import isArrayLike from './is-array-like'
import isInstanceOf from './is-instance-of'
import isSortedArray from './is-sorted-array'
import isPlainObject from './is-plain-object'

/* eslint-disable @typescript-eslint/ban-types */

//// Types ////

type Is = typeof isInstanceOf & {

    string: typeof isString
    boolean: typeof isBoolean
    number: typeof isNumber
    int: typeof isInteger
    bigint: typeof isBigInt
    primitive: typeof isPrimitive

    object: typeof isObject
    array: typeof isArray & {

        like: typeof isArrayLike
        sorted: typeof isSortedArray
        of: typeof arrayOf & {
            string: typeof isArrayOfString
            boolean: typeof isArrayOfBoolean
            number: typeof isArrayOfNumber
            int: typeof isArrayOfInt
            bigint: typeof isArrayOfBigInt

            object: typeof isArrayOfObject
            array: typeof isArrayOfArray
            function: typeof isArrayOfFunction
            symbol: typeof isArrayOfSymbol
            promise: typeof isArrayOfPromise
            date: typeof isArrayOfDate

            nan: typeof isArrayOfNaN
            truthy: typeof isArrayOfTruthy
            falsy: typeof isArrayOfFalsy
            defined: typeof isArrayOfDefined

            arrayLike: typeof isArrayOfArrayLike
            iterable: typeof isArrayOfIterable

            record: typeof isArrayOfPlainObject

            sortable: typeof isArrayOfSortable
        }
    }

    function: typeof isFunction
    symbol: typeof isSymbol
    promise: typeof isPromise
    date: typeof isDate

    nan: typeof isNaN
    truthy: typeof isTruthy
    falsy: typeof isFalsy
    defined: typeof isDefined

    even: typeof isEven
    odd: typeof isOdd
    positive: typeof isPositive
    negative: typeof isNegative
    multipleOf: typeof isMultipleOf
    integer: typeof isInteger

    type: typeof isInstanceOf
    iterable: typeof isIterable

    record: typeof isPlainObject

    sortable: typeof isSortable
    sortedArray: typeof isSortedArray
}

//// Combine ////

let is: Is
{
    is = isInstanceOf.bind(undefined) as Is
    // ^ so the original export method doesn't 
    // have new properties attached to it

    is.string = isString
    is.boolean = isBoolean
    is.number = isNumber
    is.int = isInteger
    is.bigint = isBigInt
    is.primitive = isPrimitive

    is.object = isObject
    is.function = isFunction
    is.symbol = isSymbol
    is.promise = isPromise
    is.date = isDate

    is.nan = isNaN
    is.truthy = isTruthy
    is.falsy = isFalsy
    is.defined = isDefined

    is.even = isEven
    is.odd = isOdd
    is.negative = isNegative
    is.positive = isPositive
    is.multipleOf = isMultipleOf
    is.integer = isInteger

    is.type = isInstanceOf
    is.iterable = isIterable

    is.record = isPlainObject
    is.sortable = isSortable

    is.array = merge(
        isArray.bind(undefined), 
        {
            like: isArrayLike,
            sorted: isSortedArray,
            of: merge(
                arrayOf.bind(undefined),
                {
                    string: isArrayOfString,
                    boolean: isArrayOfBoolean,
                    number: isArrayOfNumber,
                    int: isArrayOfInt,
                    bigint: isArrayOfBigInt,
                    object: isArrayOfObject,
                    array: isArrayOfArray,
                    function: isArrayOfFunction,
                    symbol: isArrayOfSymbol,
                    promise: isArrayOfPromise,
                    date: isArrayOfDate,
                    nan: isArrayOfNaN,
                    truthy: isArrayOfTruthy,
                    falsy: isArrayOfFalsy,
                    defined: isArrayOfDefined,
                    arrayLike: isArrayOfArrayLike,
                    iterable: isArrayOfIterable,
                    record: isArrayOfPlainObject,
                    sortable: isArrayOfSortable
                }
            )
        }
    )
}

//// Exports ////

export default is

export {
    is,
    Is
}