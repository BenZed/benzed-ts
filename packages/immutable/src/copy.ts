
import { 
    isArray,
    isFunc,
    isPrimitive,
    isShape,
    keysOf,
} from '@benzed/util'

//// Symbols ////

const $$copy = Symbol('=')

//// Types ////

type Refs = Set<unknown>

interface Copyable {
    [$$copy](refs?: Refs): this
}

//// Helpers ////

const isCopyable: (input: unknown) => input is Copyable = isShape({
    [$$copy]: isFunc
})

const isTypedArray = (input: unknown): input is Array<unknown> => 
    [
        Int8Array,
        Uint8Array,
        Uint8ClampedArray,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array
    ].some(TypedArray => input instanceof TypedArray)

function * copyEach<T>(iterable: Iterable<T>, refs: Refs): Generator<T> {
    for (const value of iterable)
        yield copy(value, refs)
}

function copyObject<T extends object>(input: T, refs: Refs): T {
    const output = Object.create(input)

    for (const key of keysOf(input))
        output[key] = copy(input[key], refs)

    return output
} 

//// Main ////

/**
 * Creates a data duplicate of a given value, ignoring
 * circular references.
 */
function copy<T>(value: T, refs: Refs = new Set()): T {

    if (refs.has(value))
        return value

    refs.add(value)

    if (isCopyable(value))
        return value[$$copy](refs)

    // Non-copyables just get returned as-is
    if (
        isPrimitive(value) || 
        isFunc(value) || 
        value instanceof WeakMap || 
        value instanceof WeakSet
    )
        return value

    // Implementations for standard objects

    if (isArray(value))
        return Array.from(copyEach(value, refs)) as T

    if (value instanceof Set)
        return new Set(copyEach(value, refs)) as T

    if (value instanceof Map)
        return new Map(copyEach(value.entries(), refs)) as T

    if (value instanceof RegExp)
        return new RegExp(value.source) as T

    if (value instanceof Date)
        return new Date(value.getTime()) as T

    if ('Buffer' in globalThis && value instanceof Buffer)
        return Buffer.from(value) as T

    if (isTypedArray(value)) {
        const TypedArray = value.constructor as new (...args: unknown[]) => typeof value
        return new TypedArray(value)
    }

    // Generic copy for everything else
    return copyObject(value as object, refs) as T
}

//// Exports ////

export default copy

export {

    $$copy,

    Copyable,
    isCopyable,

    copy,
    copyEach,

}