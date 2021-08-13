/* eslint-disable @typescript-eslint/no-explicit-any */

type CollectionValues<V> = Map<any, V> | Record<any, V> | ArrayLike<V>
export type CollectionValueType<C> = C extends CollectionValues<infer V> ? V : never

type CollectionKeys<K extends string | number> = Map<K, any> | Record<K, any>
export type CollectionKeyType<C> = C extends ArrayLike<any>
    ? number
    : C extends CollectionKeys<infer K>
    /**/ ? K
    /**/ : never
