import { Descriptor, DescriptorMap } from './define'
import { Key, KeysOf } from './keys'

/**
 * Iterate each descriptor of enumerable properties on any number of objects.
 */
export function descriptorsOf<T extends object[]>(...objects: T): IterableIterator<[KeysOf<T[number]>, Descriptor]> {}

/**
 * Iterate each descriptor of own properties on any number of objects.
 */
export function ownDescriptorsOf<T extends object[]>(...objects: T): IterableIterator<[KeysOf<T[number]>, Descriptor]> {}

/**
 * Iterate each descriptor of any properties on any number of objects, regardless of enumerability or
 * being prototypal
 */
export function allDescriptorsOf<T extends object[]>(...objects: T): IterableIterator<[KeysOf<T[number]>, Descriptor]> {}