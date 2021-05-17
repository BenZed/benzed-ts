/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Symbols for pseudo javascript valuetype operators ***/

export const $$copy = Symbol('=')
export const $$equals = Symbol('==')

/*** Symbols for internal use ***/

export const $$circular = Symbol('circular-reference')
export const $$excluded = Symbol('value-should-not-be-included-in-copy')

/*** Types ***/

export type Prototypal = { prototype: unknown }

export function isPrototypal(input: unknown): input is Prototypal {
    return Object.getPrototypeOf(input) !== null
}

export type Referable<T = unknown> = Record<string | symbol | number, T>

export function isReferable<T>(value: unknown): value is Referable<T> {
    if (value === null)
        return false

    const type = typeof value
    return type === 'object' || type === 'function'
}

/*** Helper ***/

export function getKeys<T>(value: T): (keyof T)[] {
    return Object.getOwnPropertyNames(value) as (keyof T)[]
}

