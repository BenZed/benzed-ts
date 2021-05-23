import isArrayLike from './is-array-like'

import {
    isArray,
    isBigInt,
    isBoolean,
    isFunction,
    isNumber,
    isObject,
    isString,
    isSymbol
} from './is-basic'

import isInstanceOf from './is-instance-of'
import isIterable from './is-iterable'
import { isInteger } from './is-math'

import type { Constructor } from './types'

/* eslint-disable
    @typescript-eslint/no-explicit-any,  
    @typescript-eslint/no-this-alias
*/

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
    return isArray(input) &&
        input.every(value => isInstanceOf(value, ...types))
}

export const isArrayOfString = everyItemInArray(isString)

export const isArrayOfBoolean = everyItemInArray(isBoolean)

export const isArrayOfNumber = everyItemInArray(isNumber)

export const isArrayOfBigInt = everyItemInArray(isBigInt)

export const isArrayOfObject = everyItemInArray(isObject)

export const isArrayOfArray = everyItemInArray(isArrayOf)

export const isArrayOfFunction = everyItemInArray(isFunction)

export const isArrayOfSymbol = everyItemInArray(isSymbol)

export const isArrayOfArrayLike = everyItemInArray(isArrayLike)

export const isArrayOfIterable = everyItemInArray(isIterable)

export const isArrayOfInt = everyItemInArray(isInteger)

/*** Exports ***/

export { isArrayOf }

export { everyItemInArray }