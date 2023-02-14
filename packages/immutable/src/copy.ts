
import { 
    isArray,
    isFunc,
    isObject,
    isPrimitive,
    isShape,
    keysOf,
} from '@benzed/util'

//// Symbols ////

const $$copy = Symbol('=')

//// Types ////

type Refs = WeakMap<object, object>

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

//// Main ////

function * copyEach<T>(iterable: Iterable<T>, refs: Refs): Generator<T> {
    for (const value of iterable)
        yield copy(value, refs)
}

/**
 * Creates a data duplicate of a given value, ignoring
 * circular references.
 */
function copy<T>(input: T, refs: Refs = new WeakMap()): T {

    // Return existing Ref
    if (isObject(input) && refs.has(input))
        return refs.get(input) as T

    // Copyable Implementation
    if (isCopyable(input)) {
        const output = input[$$copy](refs)
        refs.set(input, output)
        return output
    }

    // Non-copyables just get returned as-is
    if (
        isPrimitive(input) || 
        isFunc(input) || 
        input instanceof WeakMap || 
        input instanceof WeakSet
    )
        return input 

    // Implementations for standard objects
    if (input instanceof RegExp)
        return new RegExp(input.source) as T

    if (input instanceof Date)
        return new Date(input.getTime()) as T

    if ('Buffer' in globalThis && input instanceof Buffer)
        return Buffer.from(input) as T

    if (isTypedArray(input)) {
        const TypedArray = input.constructor as new (...args: unknown[]) => typeof input
        return new TypedArray(input)
    }

    const createFromProto = <Tx extends object>(value: Tx): Tx => {
        const blank = Object.create(value.constructor.prototype)
        refs.set(value, blank)
        return blank
    }

    const copyWithRefs = <Tx>(v: Tx): Tx => copy(v, refs)

    // Implementations requiring refs
    if (isArray(input)) {
        const array = createFromProto(input)
        array.push(...input.map(copyWithRefs))
        return array
    }

    if (input instanceof Set) {
        const set = createFromProto(input)
        input.forEach(v => set.add(copyWithRefs(v)))
        return set
    }

    if (input instanceof Map) {
        const map = createFromProto(input)
        input.forEach((k,v) => map.set(copyWithRefs(k), copyWithRefs(v)))
        return map
    }

    if (isObject(input)) {
        const object = createFromProto(input)
        for (const key of keysOf(input as object))
            object[key] = copyWithRefs(input[key])
    }

    throw new Error('Value not copyable.')
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