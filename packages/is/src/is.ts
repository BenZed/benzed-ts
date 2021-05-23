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
    isArrayOfInt
} from './is-array-of'

import {
    isEven,
    isInteger,
    isMultipleOf,
    isNegative,
    isOdd,
    isPositive
} from './is-math'

/* eslint-disable 
    @typescript-eslint/ban-types, 
*/

/*** Types ***/

type Is = typeof isInstanceOf & {

    string: typeof isString
    boolean: typeof isBoolean
    number: typeof isNumber
    bigint: typeof isBigInt

    object: typeof isObject
    array: typeof isArray
    function: typeof isFunction
    symbol: typeof isSymbol

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

        arrayLike: typeof isArrayOfArrayLike
        iterable: typeof isArrayOfIterable
    }

}

/*** Combine ***/

let is: Is

{
    is = isInstanceOf.bind(undefined) as Is

    is.string = isString
    is.boolean = isBoolean
    is.number = isNumber
    is.bigint = isBigInt

    is.object = isObject
    is.array = isArray
    is.function = isFunction
    is.symbol = isSymbol

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

    is.arrayOf.arrayLike = isArrayOfArrayLike
    is.arrayOf.iterable = isArrayOfIterable
}

/*** Exports ***/

export default is as Readonly<Is>
