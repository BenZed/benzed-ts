import { Func, Infer, nil } from '../types'
import { property } from '../property'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Symbols ////

const $$this = Symbol('callable-this-context')
interface $$This {
    [$$this]: unknown
}

const $$callable = Symbol('callable-signature-object-descriptors')
interface $$Callable {
    [$$callable]: {
        signature: Func
        descriptors: PropertyDescriptorMap
    }
}

//// Types ////

interface BoundSignature<O extends object> {
    (this: O, ...args: any): any
}

type GetSignature<S extends BoundSignature<O>, O extends object> = 
    Infer<((...args: Parameters<S>) => ReturnType<S>)>

type GetObject<T> = T extends Callable<any, infer O> ? O : never 

type GetObjects<A,B> = GetObject<A> extends never 
    ? GetObject<B> 
    : GetObject<B> extends never 
        ? B 
        : GetObject<A> & GetObject<B>

type Callable<S extends BoundSignature<O>, O extends object> = 
    GetSignature<S, O> & O

//// Context Helpers ////

const get$$Callable = (object: any): $$Callable[typeof $$callable] | nil => 
    $$callable in object ? object[$$callable] : nil

const get$$This = (object: any): unknown => object?.[$$this] 

const bind$$This = (object: any, ctx: unknown): unknown => 
    property(object, $$this, { value: ctx, writable: false, configurable: true, enumerable: false })

const set$$This = (object: any, ctx: unknown): unknown => {
    return transfer$$This({ [$$this]: ctx }, object)
}

const transfer$$This = (
    from: any, 
    to: any
): typeof to => {
    
    const transferContext = property.descriptorOf(from, $$this)
    const targetContext = property.descriptorOf(to, $$this)

    if (transferContext && (!targetContext || targetContext.writable)) {
        //                                                 ^ writable is unbound
        property(
            to, 
            $$this, { 
                ...transferContext,
                configurable: true, 
                enumerable: false 
            }
        )
    }

    return to
}

//// Main ////

const createCallableObject = <S extends BoundSignature<O>, O extends object>(
    signature: S, 
    object: O,
): Callable<GetSignature<S,O>, GetObjects<S,O>> => {

    // in case we're merging callables together
    const target = get$$Callable(signature as Partial<$$Callable>) ?? { signature, descriptors: nil }
    const source = get$$Callable(object)

    // create calling function
    const callable = function (this: unknown, ...args: Parameters<S>): ReturnType<S> {
        set$$This(callable as Partial<$$This>, this)
        return target.signature.apply(callable as O, args)
    }

    // create descriptors
    target.descriptors = {
        ...target.descriptors,
        ...source?.descriptors,
        ...property.descriptorsOf(
            ...property.prototypes(object, [Function.prototype, Object.prototype]),
            object
        ),
    }
    delete target.descriptors.prototype

    return property.define(
        callable,
        {
            ...target.descriptors,
            [$$callable]: {
                value: { ...target },
                writable: false,
                enumerable: false,
                configurable: false
            }
        }        
    ) as any
}

//// Exports ////

export default createCallableObject

export {
    createCallableObject,
    BoundSignature,
    GetSignature,
    GetObjects,

    Callable,

    $$callable,
    $$Callable,

    $$This,
    get$$This,
    set$$This,
    bind$$This,
    transfer$$This
}