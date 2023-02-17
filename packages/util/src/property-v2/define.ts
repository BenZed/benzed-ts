
//// Types ////

import { Key } from './keys'

export type Descriptor = PropertyDescriptor

export type DescriptorMap = Map<Key, Descriptor>

export type DescriptorRecord = Record<Key, Descriptor>

//// Define ////

/**
 * Define a property on an object with a key and a descriptor. 
 */
export function define<T extends object>(object: T, key: Key, descriptor: Descriptor): T

/**
 * Define multiple properties on an object with a descriptor record.
 */
export function define<T extends object>(object: T, map: DescriptorMap | DescriptorRecord): T 

export function define<T extends object>(object: T, ...args: [Key, Descriptor] | [DescriptorMap | DescriptorRecord]): T {

    const descriptors = toDescriptorRecord(...args)
    Object.defineProperties(object, descriptors)

    return object
}

//// Helper ////

function toDescriptorRecord(...args: [Key, Descriptor] | [DescriptorMap | DescriptorRecord]): DescriptorRecord {

    const entries = args.length === 2 
        ? [args] 
        : args[0] instanceof Map 
            ? args[0].entries()
            : Object.entries(args[0])

    const output: DescriptorRecord = {}
    for ( const [key, descriptor] of entries) 
        output[key] = descriptor

    return output  
}

// function toDescriptorMap(...args: [Key, Descriptor] | [DescriptorMap | DescriptorRecord]): DescriptorRecord {

//     if (input instanceof Map)
//         return input

//     const map: DescriptorMap = new Map()
//     for (const key in input)
//         map.set(key, input[key])

//     return map
// }
