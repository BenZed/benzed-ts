
import { 

    Empty,
    Func, 
    keysOf, 

    nil,
    Primitive,
    isFunc
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

interface Descriptors {
    [key: string | number | symbol]: PropertyDescriptor
}

// TODO resolve tuples
type _ResolveArray<T> = T extends Array<infer I>

    ? _ExtractProperties<I[], T> extends Empty
        ? I[] 
        : I[] & _ExtractProperties<I[], T>
    : T extends Readonly<Array<infer I>>

        ? _ExtractProperties<readonly I[], T> extends Empty
            ? readonly I[] 
            : I[] & _ExtractProperties<readonly I[], T>
        : T

type _FuncWithoutThis<T> = T extends (...args: infer A) => infer R 
    ? (...args: A) => R
    : never

type _IsFunc<T> = T extends Func ? true : false

type _HasUndefined<T> = keyof {
    [K in keyof T as T[K] extends undefined ? K : never]: K
} extends never ? false : true

type _RemoveUndefined<T> = _HasUndefined<T> extends true 
    ? { 
        [K in keyof T as T[K] extends undefined 
            ? never 
            : K]: T[K] 

    } extends infer O ? _FuncWithoutThis<T> extends never ? O : _FuncWithoutThis<T> & O : never 
    
    : T

/**
 * Compile two objects into one favouring properties from the 
 * extension over the original.
 * 
 * Remove the existing 'extend' property, as it will be added
 * by the Extendable type.
 */
type _MergeProperties<O, E> = {
    [K in keyof E | keyof O]: K extends keyof E 
        ? E[K] 
        : K extends keyof O ? O[K] 
            : never

} extends infer T 
    ? _ResolveArray<T>
    : never

type _ExtractProperties<O, E> = {

    [K in keyof E as K extends keyof O 
        ? E[K] extends O[K]
            ? never 
            : K
        : K
    ]: E[K]

} extends infer T ? _ResolveArray<T> : never

type _MergeCallSignature<O, E> = _IsFunc<E> extends true 
    ? _FuncWithoutThis<E> 
    : _FuncWithoutThis<O>

/**
 * Given an original and an extension, merge two objects 
 * together, favouring properties and call signatures from 
 * the extension.
 */
type _Merge<O, E> = _MergeCallSignature<O, E> extends never     
    ? _MergeProperties<O, E> 
    : _MergeProperties<O, E> extends Empty 
        ? _MergeCallSignature<O, E> 
        : _MergeProperties<O, E> & _MergeCallSignature<O, E>

/**
 * Given an extension and an original object, extract
 * call signatures and properties from the extension object
 * that the original does not have.
 */
type _Extract<O, E> = _ExtractCallSignature<O, E> extends never 
    ? _ExtractProperties<O, E>
    : _ExtractProperties<O, E> extends Empty 
        ? _ExtractCallSignature<O, E>
        : _ExtractCallSignature<O, E> & _ExtractProperties<O, E>

type _ExtractCallSignature<O, E> = _FuncWithoutThis<E> extends _FuncWithoutThis<O>
    ? never 
    : _FuncWithoutThis<E>

type _HasExtractable<O, E> = _Extract<O, E> extends (never | Empty) ? false : true

type _MergeIfNecessary<O, E> = 
/**/ _HasExtractable<O, E> extends true 
    ? _HasExtractable<E, O> extends true 
        ? _Merge<O, E>
        : E
    : O

type _ShouldMergeCallSignatures<O,E> = 
    _IsFunc<E> extends true 
        ? _IsFunc<O> extends true   
            ? true
            : false
        : false 

type _ShouldMergeProperties<O, E> = keyof {
    [K in keyof _ExtractProperties<O,E> as K extends keyof E
        ? K extends keyof O 
            ? E[K] extends O[K]
                ? never 
                : K
            : never
        : K
    ]: K
} extends never ? false : true
        
type _ShouldMerge<O, E> = _ShouldMergeCallSignatures<O, E> extends true ? true 
    : _ShouldMergeProperties<O, E>  

//// Extend Types ////

/**
 * Provide inferred <this> context to properties/methods
 * being extended.
 */
type Extension<T> = 
    // an extension can be a method
    | ((this: T, ...args: any[]) => any) 

    // or an object that may contain methods
    | {
        [key: string | number | symbol]: (
            (
                this: T, 
                ...args: any[]
            ) => any
            // or other values
        ) | object | Primitive
    } 

    // or whatever, say some asshole wants to extend
    // a regexp or something
    | object

/**
 * Apply an extension to a given original type
 */
type Extend<O, E> = _ShouldMerge<O, E> extends true 
    ? Extendable<_RemoveUndefined<_MergeIfNecessary<O, E>>>
    : _RemoveUndefined<_Extract<O, E>> extends Empty 
        ? Extendable<O> 
        : Extended<O, _RemoveUndefined<_Extract<O, E>>>

/**
 * Remove the extend method property <this> context from types that are to be extended
 */
type ToExtendable<T> = T extends { extend: any }
    ? _Extract<{ extend: any }, T> 
    : T extends Func ? _FuncWithoutThis<T> : T

/**
 * An object that has been extended.
 */
type Extended<O, E> = O & E & { 
    extend: <Ex extends Extension<O & E>>(extension: Ex) => Extend<O, _MergeIfNecessary<E, ToExtendable<Ex>>>
}

/**
 * Add an extend method to a given type.
 */
type Extendable<O> = O & { 
    extend: <E extends Extension<O>>(extension: E) => Extend<O, ToExtendable<E>>
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
        value: extendable,
        enumerable: false,
        configurable: false,
        writable: false
    },

    [$$copy]: {
        value: copy,
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

const isExtendedCallSignature = (i: unknown): i is { [$$callable]: Func } =>
    !!i && $$callable in i

const getCallable = (
    object: object, 
): Func | nil => isExtendedCallSignature(object) 
    ? object[$$callable] 
    : isFunc(object)
        ? object 
        : nil

function copy(this: Extendable<object>): Extendable<object> {
    return extendable(this) as Extendable<object>
}

//// Extend ////

/**
 * Add an 'extend' method to any object, allowing
 * immutable typesafe addition or overwrite of arbitrary 
 * properties and call signatures.
 * 
 * @param object object or function add extend method to.
 */
function extendable<T extends Extension<object>>(object: T): Extendable<ToExtendable<T>> 

/**
 * Implementation signature
 * @internal
 */
function extendable(this: object | void, extension: object): object {

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

/**
 * Make an object extendable, and extend it unto another
 * @param source 
 * @param target 
 */
function extend<A extends Extension<object>, B extends Extension<object>>(
    source: A, 
    target: B
): Extend<ToExtendable<A>, ToExtendable<B>> {
    return extendable(source).extend(target)
}

//// Export ////

export {
    extend,
    extendable,
    Extendable,
    Extended,
    Extend,
    ToExtendable
}