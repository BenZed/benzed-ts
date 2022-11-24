
import { 

    Func, 
    keysOf, 
    Merge, 
    nil, 
    Primitive

} from '@benzed/util'

import { $$copy } from './symbols'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Symbol ////

const $$extendable = Symbol('extendable')

//// Types ////

type Descriptors = {
    [x: string | symbol | number]: PropertyDescriptor
}

type Extension<T extends Func | object> = 
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

    | object

type ExtendableMethod<T extends Func> = ((...args: Parameters<T>) => ReturnType<T>) & ExtendableObject<T>

type ExtendableObject<T extends object> = {

    [K in keyof T | 'extend']: K extends 'extend' 
        ? <Tx extends Extension<T>>(extension: Tx) => Extendable<Merge<[T, Tx]>> 
        : K extends keyof T ? T[K] : K
}

type Extendable<T extends Func | object> = T extends Func 
    ? ExtendableMethod<T>
    : ExtendableObject<T>

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

//// Extend ////

function extend (this: void | Func | object, extension?: Func | object): unknown {

    // Disallow arrays. 
    if (Array.isArray(extension))
        throw new Error('Cannot extend Arrays')

    // Determine if this extendable has a method
    const method = typeof extension === 'function' 
        ? extension as Func
        : (this as void | { [$$extendable]: Func | nil })?.[$$extendable]

    // Create descriptors
    const original = this ?? {}
    const descriptors = getDescriptors(method, original, extension)

    // Extend
    const extended = applyDescriptors(
        
        method 
            ? (...args: unknown[]): unknown => method.apply(extended, args)
            : {}, 
        
        descriptors
    )
    return extended
}

//// Interface ////

/**
 * Give any object an '.extend' method, allowing typesafe immutable application of
 * properties, methods or callable signatures.
 */
function extendable<T extends Func | object>(object: T): Extendable<T> {
    return extend(object) as Extendable<T>
}

//// Export ////

export default extendable

export {
    extendable,
    Extendable,
    ExtendableMethod,
    ExtendableObject
}