
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
    [x: string | symbol | number]: PropertyDescriptor
}

/**
 * Compile two objects into non-conflicting single object, 
 * favouring properties from the extension over the original.
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
        : T 
    : never
// ^ pretty print

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

    // or an object containing methods
    | {
        [key: string | number | symbol]: (
            (
                this: Extendable<T>, 
                ...args: any[]
            ) => any
        ) | object | Primitive
    }

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
    extension: object | nil
): Descriptors => ({

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

    ...callable && {
        [$$callable]: {
            value: callable,
            enumerable: true,
            configurable: false,
            writable: false
        }
    }
})

const applyDescriptors = (

    object: object, 
    descriptors: { 
        [x: string | symbol | number]: PropertyDescriptor 
    }

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

    // Disallow arrays. 
    if (Array.isArray(extension))
        throw new Error('Cannot extend Arrays')

    const original = this ?? nil

    // Get call signature for this extendable, if there is one
    const callable = getCallable(extension) ?? (original && getCallable(original))

    // Create descriptors
    const descriptors = createDescriptors(callable, original, extension)

    // Extend
    const extended = applyDescriptors(
        
        callable 
            // wrap callable to keep <this> context up to date with changes
            // to the extended object
            ? (...args: unknown[]): unknown => callable.apply(extended, args)
            
            : {}, 
        
        descriptors
    )

    return extended
}

//// Export ////

export {
    extend as extendable,
    Extendable
}