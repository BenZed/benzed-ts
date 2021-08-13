/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types, 
    @typescript-eslint/indent
*/

/*** Prototypal ***/

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

/*** Mutable ***/

/**
 * Make a readonly type mutable
 */
export type Mutable<T> = {
    -readonly [P in keyof T]: T[P]
}

type ImmutablePrimitive = undefined | null | boolean | string | number | Function
type ImmutableMap<K, V> = ReadonlyMap<Immutable<K>, Immutable<V>>
type ImmutableSet<T> = ReadonlySet<Immutable<T>>
type ImmutableObject<T> = { readonly [K in keyof T]: Immutable<T[K]> }

/*** Immutable ***/

/**
 * Deep immutability
 */
export type Immutable<T> =
    T extends ImmutablePrimitive ? T :
    T extends Map<infer K, infer V> ? ImmutableMap<K, V> :
    T extends Set<infer M> ? ImmutableSet<M> : ImmutableObject<T>

/*** Helper ***/

export function getKeys<T>(value: T): (keyof T)[] {
    return Object.getOwnPropertyNames(value) as (keyof T)[]
}