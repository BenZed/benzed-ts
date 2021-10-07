/* eslint-disable @typescript-eslint/no-explicit-any */

type CollectionValues<V> = Map<any, V> | Record<any, V> | ArrayLike<V>
export type CollectionValueType<C> = C extends CollectionValues<infer V> ? V : never

type CollectionKeys<K extends string | number> = Map<K, any> | Record<K, any>
export type CollectionKeyType<C> = C extends ArrayLike<any>
    ? number
    : C extends CollectionKeys<infer K>
    /**/ ? K
    /**/ : never

export type TypeMatchedKeys<T1, K1 extends keyof T1, T2> = {
    [K2 in keyof T2]: T2[K2] extends T1[K1] ? K2 : never
}[keyof T2]

export type UnknownObject<T> = { [P in keyof T]: unknown }

export type Func<A extends any[] = unknown[], V = unknown> = (...args: A) => V

export type Json =
    null | string | number | boolean |
    Json[] |
    { [prop: string]: Json }