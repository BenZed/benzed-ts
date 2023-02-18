
import { 
    isArray,
    isFunc,
    isObject,
    isShape,
    each
} from '@benzed/util'

//// Symbols ////

const $$copy = Symbol('=')

//// Types ////

type Refs = WeakMap<object, object>

interface Copyable {
    [$$copy](refs?: Refs): this
}

//// Helpers ////

const isCopyable: (input: unknown) => input is Copyable = 
    isShape({
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

    // non-copyables returned as-is
    if (
        !isObject(input) || 
        input instanceof WeakMap || 
        input instanceof WeakSet
    )
        return input 

    // Return existing Ref
    if (refs.has(input))
        return refs.get(input) as T

    const setRef = <Tx extends object>(
        output: Tx
    ): Tx => {
        refs.set(input, output)
        return output
    }

    // Copyable Implementation
    if (isCopyable(input)) 
        return setRef(input[$$copy]())

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

    const copyWithRefs = <Tx>(v: Tx): Tx => copy(v, refs)

    if (isArray(input)) {
        const array = setRef([] as typeof input)
        array.push(...input.map(copyWithRefs))
        return array
    }

    if (input instanceof Set) {
        const set = setRef(new Set)
        input.forEach(v => set.add(copyWithRefs(v)))
        return set as T
    }

    if (input instanceof Map) {
        const map = setRef(new Map)
        input.forEach((v,k) => map.set(copyWithRefs(k), copyWithRefs(v)))
        return map as T
    }

    const object = setRef(Object.create(input))
    for (const key of each.keyOf(input))
        object[key] = copyWithRefs(input[key])
    
    return object
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