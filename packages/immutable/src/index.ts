import { Copyable } from './copy'
import { Comparable } from './equals'

//// Types ////

type CopyComparable<T> = Copyable<T> & Comparable<T>

//// Exports ////

export * from './copy'
export * from './equals'
export { CopyComparable }

export * from './array'
export * from './memoize'
export * from './value-map'

export * from './util'

export { $$copy, $$equals } from './symbols'
