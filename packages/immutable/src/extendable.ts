
import { 

    Empty,
    Func, 
    keysOf, 

    nil,
    Primitive

} from '@benzed/util'

import { 
    $$copy, 
    $$callable 
} from './symbols'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-this-alias
*/

//// Helper Types ////

type Descriptors = {
    [key: string | number | symbol]: PropertyDescriptor
}

/**
 * Compile two objects into one favouring properties from the 
 * extension over the original.
 * 
 * Remove the existing 'extend' property, as it will be added
 * by the Extendable type.
 */
type _ResolveObject<E, O> = {
    [K in keyof O | keyof E as K extends 'extend' ? never : K]: K extends keyof E 
        ? E[K] 
        : K extends keyof O 
            ? O[K] 
            : never

} extends infer T 
    ? Empty extends T 
        ? never 
        : _ResolveArray<T>
    : never

// TODO resolve tuples
type _ResolveArray<T> = T extends Array<infer I>
    ? I[] & _ExcludeArrayKeys<T>
    : T extends Readonly<Array<infer I>>
        ? readonly I[] & _ExcludeArrayKeys<T>
        : T

type _ExcludeArrayKeys<A> = {
    [K in keyof A as K extends keyof Array<any> ? never : K]: A[K]
} extends infer Tx ? Tx : never

type _ResolveCallable<T> = T extends (...args: infer A) => infer R 
    ? (...args: A) => R
    : never

//// Extend Types ////

/**
 * Provide inferred <this> context to properties/methods
 * being extended.
 */
type Extension<T> = 

    // an extension can be a method
    | ((this: Extendable<T>, ...args: any[]) => any) 

    // or an object that may contain methods
    | {
        [key: string | number | symbol]: (
            (
                this: Extendable<T>, 
                ...args: any[]
            ) => any
            // or other values
        ) | object | Primitive
    } 

    // or whatever, say some asshole wants to extend
    // a regexp or something
    | object

/**
 * Given an extension and optional original object,
 * resolve an object without conflicting properties
 * and a maximum of one call signature. 
 */
type Extend<E, O = void> = _ResolveCallable<E> extends never
    ? _ResolveCallable<O> extends never
        ? _ResolveObject<E, O> 
        : _ResolveObject<E, O> extends never
            ? _ResolveCallable<O>
            : _ResolveCallable<O> & _ResolveObject<E, O> 

    : _ResolveObject<E, O> extends never
        ? _ResolveCallable<E>
        : _ResolveCallable<E> & _ResolveObject<E, O> 

/**
 * Add an extend method to a given type.
 */
type Extendable<O> = O & { 
    extend: <E extends Extension<O>>(extension: E) => Extendable<Extend<E, O>> 
}

//// Helper ////

const createDescriptors = (
    callable: Func | nil,
    original: object | nil,
    extension: object | nil,
    isArray: boolean
): Descriptors => ({

    ...callable && {
        [$$callable]: {
            value: callable,
            enumerable: false,
            configurable: false,
            writable: false
        },
        // only add array properties if this extendable is going to be 
        // callable, as the calling method won't have them.
        ...isArray && Object.getOwnPropertyDescriptors(Array.prototype)
    } as Descriptors,

    ...original && Object.getOwnPropertyDescriptors(original),

    ...extension && Object.getOwnPropertyDescriptors(extension),

    extend: {
        value: extend,
        enumerable: false,
        configurable: false,
        writable: false
    },

    [$$copy]: {
        value: extend,
        enumerable: false,
        configurable: false,
        writable: false
    },

})

const applyDescriptors = (

    object: object, 
    descriptors: Descriptors

): object => {

    for (const key of keysOf(descriptors)) {
        const descriptor = descriptors[key]

        Object.defineProperty(object, key, descriptor)
    }

    return object
}

const isFunc = (i: unknown): i is Func => 
    typeof i === 'function'

const isExtendedCallSignature = (i: unknown): i is { [$$callable]: Func } =>
    !!i && $$callable in i

const getCallable = (
    object: object, 
): Func | nil => 
    isExtendedCallSignature(object) 
        ? object[$$callable] 
        : isFunc(object)
            ? object 
            : nil

//// Extend ////

/**
 * Add an 'extend' method to any object, allowing
 * immutable typesafe addition or overwrite of arbitrary 
 * properties and call signatures.
 * 
 * @param object object or function add extend method to.
 */
function extend<T extends object>(object: T): Extendable<Extend<T>> 

/**
 * Implementation signature. 
 * @internal
 */
function extend(this: object | void, extension: object): object {

    const original = this ?? nil

    // Get call signature for this extendable, if there is one
    const callable = getCallable(extension) ?? (original && getCallable(original))

    // Handle extending arrays
    const isArray = Array.isArray(extension) || Array.isArray(original)

    // Create descriptors
    const descriptors = createDescriptors(callable, original, extension, isArray)

    // Extend
    const extended = applyDescriptors(
        callable 
            // wrap callable to keep <this> context up to date with changes
            // to the extended object
            ? (...args: unknown[]): unknown => callable.apply(extended, args)
            : isArray ? [] : {}, 
        descriptors,
    )

    return extended
}

//// Export ////

export {
    extend as extendable,
    Extendable
}