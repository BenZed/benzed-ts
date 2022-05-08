/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

import {
    isArray,
    isBigInt,
    isBoolean,
    isDate,
    isDefined,
    isFalsy,
    isFunction,
    isNaN,
    isNumber,
    isObject,
    isPromise,
    isSortable,
    isString,
    isSymbol,
    isTruthy
} from './is-basic'

import isInstanceOf from './is-instance-of'
import isIterable from './is-iterable'
import { isInteger } from './is-math'

import type { Constructor } from './types'

import isArrayLike from './is-array-like'
import isPlainObject from './is-plain-object'

/*** Helper ***/

function everyItemInArray<T>(
    predicate: (input: unknown) => input is T,
): (input: unknown) => input is T[] {

    return (input: unknown): input is T[] =>
        isArray(input) &&
        input.length > 0 &&
        input.every(predicate)
}

/*** Main ***/

/**
 * True if a given value is an arraylike of instances of the given types
 * @param input value
 * @param types types to check against
 * @returns true or false
 */
export default function isArrayOf<T extends (Constructor<any>)[]>(
    input: unknown,
    ...types: T
): input is (InstanceType<typeof types[number]>)[] {

    if (types.length === 0)
        throw new Error('At least one type is required.')

    return isArray(input) &&
        input.length > 0 &&
        input.every(value => isInstanceOf(value, ...types))
}

export const isArrayOfString = everyItemInArray(isString)

export const isArrayOfBoolean = everyItemInArray(isBoolean)

export const isArrayOfNumber = everyItemInArray(isNumber)

export const isArrayOfBigInt = everyItemInArray(isBigInt)

export const isArrayOfObject = everyItemInArray(isObject)

export const isArrayOfArray = everyItemInArray(isArray)

export const isArrayOfFunction = everyItemInArray(isFunction)

export const isArrayOfSymbol = everyItemInArray(isSymbol)

export const isArrayOfPromise = everyItemInArray(isPromise)

export const isArrayOfDate = everyItemInArray(isDate)

export const isArrayOfArrayLike = everyItemInArray(isArrayLike)

export const isArrayOfIterable = everyItemInArray(isIterable)

export const isArrayOfInt = everyItemInArray(isInteger)

export const isArrayOfNaN = everyItemInArray(
    isNaN as (input: unknown) => input is number
)

export const isArrayOfPlainObject = everyItemInArray(isPlainObject)

export const isArrayOfSortable = everyItemInArray(isSortable)

export const isArrayOfDefined = everyItemInArray(isDefined)

export const isArrayOfTruthy = everyItemInArray(isTruthy)

export const isArrayOfFalsy = everyItemInArray(isFalsy)

/*** Exports ***/

export { isArrayOf }