import { each } from '../../../each/src'

/**
 * Define a property on an object with a key and a descriptor. 
 */
export function define<T extends object>(object: T, key: PropertyKey, descriptor: PropertyDescriptor): T

/**
 * Define multiple properties on an object with a descriptor record.
 */
export function define<T extends object>(object: T, map: PropertyDescriptorMap): T 

export function define<T extends object>(object: T, ...args: [PropertyKey, PropertyDescriptor] | [PropertyDescriptorMap]): T {

    const descriptors = toPropertyDescriptorMap(...args)

    Object.defineProperties(object, descriptors)

    return object
}

/**
 * Shorthand for defining a 'name' property with the descriptors attributes:
 * 
 * ```ts
 * { 
 *    writable: true, 
 *    configurable: true, 
 *    enumerable: false 
 * }
 * ```
 */
define.named = function defineName<T extends object>(name: string, object: T): T {
    return define.enumerable(
        object, 
        'name', 
        name
    )
}

/**
 * Shorthand for defining a value descriptor with attributes: 
 * 
 * ```ts
 * { 
 *    writable: true, 
 *    configurable: true, 
 *    enumerable: true 
 * }
 * ```
 */
define.enumerable = function defineEnumerable<T extends object>(object: T, key: PropertyKey, value: unknown): T {
    return define(
        object, 
        key, 
        { 
            value, 
            enumerable: true, 
            writable: true, 
            configurable: true 
        }
    )
}

/**
 * Shorthand for defining a value descriptor with attributes: 
 * 
 * ```ts
 * { 
 *    writable: true, 
 *    configurable: true, 
 *    enumerable: false 
 * }
 * ```
 */
define.nonEnumerable = function defineNonEnumerable<T extends object>(object: T, key: PropertyKey, value: unknown): T {
    return define(
        object, 
        key, 
        { 
            value, 
            writable: true, 
            configurable: true 
        }
    )
}

define.hidden = define.nonEnumerable

/**
 * Shorthand for defining a value descriptor with a getter
 */
define.get = function defineGet<T extends object>(object: T, key: PropertyKey, get: () => unknown): T {
    return define(
        object, 
        key, 
        { 
            get, 
            configurable: true
        }
    )
}

/**
 * Shorthand for defining a value descriptor with a setter
 */
define.set = function defineSet<T extends object>(object: T, key: PropertyKey, set: (value: unknown) => void): T {
    return define(
        object, 
        key, 
        { 
            set, 
            configurable: true 
        }
    )
}

/**
 * Shorthand for defining a value descriptor with a getter and setter
 */
define.access = function defineAccessor<T extends object>(object: T, key: PropertyKey, get: () => unknown, set: (value: unknown) => void): T {
    return define(
        object, 
        key, 
        { 
            get,
            set, 
            configurable: true 
        }
    )
}

/**
 * Assign all of the defined property descriptors on a source object onto the target object.
 * Optionally include an array of objects in the prototype's source chain not to include.
 */
define.transpose = function defineTranspose<T extends object>(source: object, target: T, blacklist: object[] = []): T {

    for (const proto of each.prototypeOf(source).toArray().reverse()) {

        if (blacklist.includes(proto))
            continue

        for (const [key, descriptor] of each.defined.own.descriptorOf(proto))
            define(target, key, descriptor)
    }

    return target
}

//// Helper ////

function toPropertyDescriptorMap(...args: [PropertyKey, PropertyDescriptor] | [PropertyDescriptorMap]): PropertyDescriptorMap {

    const entries = args.length === 2 
        ? [args] 
        : args[0] instanceof Map 
            ? args[0].entries()
            : Object.entries(args[0])

    const output: PropertyDescriptorMap = {}
    for (const [key, descriptor] of entries) 
        output[key] = descriptor

    return output  
}

