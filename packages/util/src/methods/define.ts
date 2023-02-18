
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

define.named = function defineName<T extends object>(name: string, object: T): T {
    return define.enumerable(
        object, 
        'name', 
        name
    )
}

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

define.hidden = function defineNonEnumerable<T extends object>(object: T, key: PropertyKey, value: unknown): T {
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

