
/* eslint-disable 
    @typescript-eslint/ban-types
*/

import { Falsy, Sortable } from './types'

/*** Constants ***/

const BOXABLE_PRIMITIVES = {
    string: String,
    number: Number,
    boolean: Boolean
}

/*** Helper ***/

function isLiteralOrBoxed(
    input: unknown,
    primitive: 'string' | 'boolean' | 'number'
): boolean {
    const type = typeof input
    return type === primitive ||
        type === `object` && input instanceof BOXABLE_PRIMITIVES[primitive]
}

/*** Main ***/

export function isString(input: unknown): input is string {
    return isLiteralOrBoxed(input, `string`)
}

export function isBoolean(input: unknown): input is boolean {
    return isLiteralOrBoxed(input, `boolean`)
}

export function isNumber(input: unknown): input is number {
    return !isNaN(input) && isLiteralOrBoxed(input, `number`)
}

export function isSymbol(input: unknown): input is symbol {
    return typeof input === `symbol`
}

export function isNaN(input: unknown): boolean {
    return Number.isNaN(input)
}

export function isBigInt(input: unknown): input is bigint {
    return typeof input === `bigint`
}

export function isObject<O extends object>(input: unknown): input is O {
    return input !== null && typeof input === `object`
}

export function isArray<T extends unknown[] = unknown[]>(input: unknown): input is T {
    return Array.isArray(input)
}

export function isFunction<F extends Function>(input: unknown): input is F {
    return typeof input === `function`
}

export function isPromise<T>(input: unknown): input is Promise<T> {
    return input instanceof Promise
}

export function isDate(input: unknown): input is Date {
    return input instanceof Date
}

export function isDefined<T>(input: T): input is Exclude<T, null | undefined> {
    return input != null && !isNaN(input)
}

export function isTruthy<T>(input: T): input is Exclude<T, Falsy> {
    return !!input
}

export function isFalsy<T>(input: T): input is Extract<T, Falsy> {
    return !input
}

export function isSortable(input: unknown): input is Sortable {

    if (isNumber(input) || isString(input) || isBigInt(input))
        return true

    if (!isObject(input) || !isFunction(input.valueOf))
        return false

    const value = input.valueOf()

    return isNumber(value) || isString(value) || isBigInt(value)

}

export function isPrimitive(
    input: unknown
): input is number | bigint | string | boolean | null | undefined {

    return input == null ||
        isNumber(input) ||
        isBigInt(input) ||
        isString(input) ||
        isBoolean(input)
}