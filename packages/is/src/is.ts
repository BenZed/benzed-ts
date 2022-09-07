import isInstanceOf from './is-instance-of'

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

import isArrayLike from './is-array-like'
import isIterable from './is-iterable'

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
import isSortedArray from './is-sorted-array'
import isPlainObject from './is-plain-object'

/* eslint-disable 
    @typescript-eslint/ban-types, 
*/

/*** Types ***/

type Is = typeof isInstanceOf & {

    string: typeof isString
    boolean: typeof isBoolean
    number: typeof isNumber
    int: typeof isInteger
    bigint: typeof isBigInt
    primitive: typeof isPrimitive

    object: typeof isObject
    array: typeof isArray
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

    instanceOf: typeof isInstanceOf
    arrayLike: typeof isArrayLike
    iterable: typeof isIterable

    plainObject: typeof isPlainObject

    sortable: typeof isSortable
    sortedArray: typeof isSortedArray

    arrayOf: typeof arrayOf & {
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

        plainObject: typeof isArrayOfPlainObject

        sortable: typeof isArrayOfSortable
    }
}

/*** Combine ***/

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
    is.array = isArray
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

    is.instanceOf = isInstanceOf
    is.arrayLike = isArrayLike
    is.iterable = isIterable

    is.plainObject = isPlainObject

    is.sortable = isSortable
    is.sortedArray = isSortedArray

    is.arrayOf = arrayOf.bind(undefined) as Is['arrayOf']

    is.arrayOf.string = isArrayOfString
    is.arrayOf.boolean = isArrayOfBoolean
    is.arrayOf.number = isArrayOfNumber
    is.arrayOf.int = isArrayOfInt
    is.arrayOf.bigint = isArrayOfBigInt

    is.arrayOf.object = isArrayOfObject
    is.arrayOf.array = isArrayOfArray
    is.arrayOf.function = isArrayOfFunction
    is.arrayOf.symbol = isArrayOfSymbol
    is.arrayOf.promise = isArrayOfPromise
    is.arrayOf.date = isArrayOfDate

    is.arrayOf.nan = isArrayOfNaN
    is.arrayOf.truthy = isArrayOfTruthy
    is.arrayOf.falsy = isArrayOfFalsy
    is.arrayOf.defined = isArrayOfDefined

    is.arrayOf.arrayLike = isArrayOfArrayLike
    is.arrayOf.iterable = isArrayOfIterable

    is.arrayOf.plainObject = isArrayOfPlainObject

    is.arrayOf.sortable = isArrayOfSortable
}

/*** Exports ***/

export default is
