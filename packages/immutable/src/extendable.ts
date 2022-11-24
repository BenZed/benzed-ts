
import { 

    Empty,
    Func, 
    keysOf, 
    nil, 
    Primitive

} from '@benzed/util'

import { $$copy } from './symbols'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-this-alias
*/

//// Symbol ////

const $$extendable = Symbol('extendable')

//// Helper Types ////

type Descriptors = {
    [x: string | symbol | number]: PropertyDescriptor
}

type _ExtendObject<E, O> = {
    [K in keyof O | keyof E as K extends 'extend' ? never : K]: K extends keyof E 
        ? E[K] 
        : K extends keyof O 
            ? O[K] 
            : never
} extends infer T ? Empty extends T ? never : T : never

type _ExtendFunc<T> = T extends (...args: infer A) => infer R 
    ? (...args: A) => R
    : never

//// Extend Types ////

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
        ) | Primitive | object
    }
    
type Extend<E, O = void> = _ExtendFunc<E> extends never
    ? _ExtendFunc<O> extends never
        ? _ExtendObject<E, O> 
        : _ExtendObject<E, O> extends never
            ? _ExtendFunc<O>
            : _ExtendFunc<O> & _ExtendObject<E, O> 

    : _ExtendObject<E, O> extends never
        ? _ExtendFunc<E>
        : _ExtendFunc<E> & _ExtendObject<E, O> 

type Extendable<O> = O & { 
    extend: <E extends Extension<O>>(extension: E) => Extendable<Extend<E, O>> 
}

//// Helper ////

const getDescriptors = (
    method: Func | nil,
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

    [$$extendable]: {
        value: method,
        enumerable: false,
        configurable: false,
        writable: false
    }

})

const applyDescriptors = (

    object: object, 
    descriptors: { [x: string | symbol | number]: PropertyDescriptor }

): object => {

    for (const key of keysOf(descriptors)) {
        const descriptor = descriptors[key]

        Object.defineProperty(object, key, descriptor)
    }

    return object
}

const getMethod = (
    original: nil | object, 
    extension: nil | object
): Func | nil => {
    if (typeof extension === 'function')
        return extension as Func

    if (typeof original === 'object' && original !== null)
        return (original as { [$$extendable]: Func | nil })[$$extendable]

    return nil
}

//// Extend ////

function extend <O extends object, E extends object>(this: O | void, extension: E): Extendable<Extend<O,E>> {

    // Disallow arrays. 
    if (Array.isArray(extension))
        throw new Error('Cannot extend Arrays')

    const original = this ?? nil

    // Determine if this extendable has a method
    const method = getMethod(original, extension)

    // Create descriptors
    const descriptors = getDescriptors(method, original, extension)

    // Extend
    const extended = applyDescriptors(
        
        method 
            // wrap method to keep <this> context up to date with changes
            // to extended object
            ? (...args: unknown[]): unknown => method.apply(extended, args)
            
            : {}, 
        
        descriptors
    )

    return extended as Extendable<Extend<O, E>>
}

//// Interface ////

/**
 * Give any object an '.extend' method, allowing typesafe immutable application of
 * properties, methods or callable signatures.
 */
function extendable<T extends object>(object: T): Extendable<Extend<T>> {
    return extend(object) as Extendable<Extend<T>>
}

//// Export ////

export default extendable

export {
    extendable,
    Extendable,
}