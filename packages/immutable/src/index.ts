import { Copyable } from './copy'
import { Comparable } from './equals'

//// Exports ////

export * from './copy'
export * from './equals'
export type CopyComparable = Copyable & Comparable

export * from './array'
export * from './memoize'
export * from './value-map'

export { Immutable, Mutable, isObject, isArrayLike, isFunction } from './util'

export { $$copy, $$equals } from './symbols'
