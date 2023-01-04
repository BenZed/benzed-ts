import createCallableObject, { 

    BoundSignature, 
    GetSignature, 
    GetObjects,
    
    Callable,

    bind$$This, 
    get$$This, 
    transfer$$This, 

} from './object'

import createCallableClass, { 
    isClass, 
    Class, 
    CallableClass,
    isInstance,
    resolveInstance,
    $$constructor,
} from './class'

import type { Func } from '../types'

//// Main ////

function callable<S extends BoundSignature<InstanceType<C>>, C extends Class>(
    signature: S,
    constructor: C,
    name?: string,
): CallableClass<GetSignature<S, InstanceType<C>>, C>

function callable<S extends BoundSignature<O>, O extends object>(
    signature: S,
    object: O
): Callable<GetSignature<S,O>, GetObjects<S,O>>

function callable(
    signature: Func,
    objectOrConstructor: object | Func,
    name?: string
): object {

    return isClass(objectOrConstructor)
        ? createCallableClass(
            signature, 
            objectOrConstructor, 
            name,
        )
       
        : createCallableObject(
            signature, 
            objectOrConstructor 
        )
}

//// Extend ////

/**
 * Retreive the outer *this* context of a callable object.
 */
callable.getContext = get$$This

/**
 * Bind the outer *this* context of a callable object
 */
callable.bindContext = bind$$This

/**
 * Transfer the outer *this* context to another callable 
 */
callable.transferContext = transfer$$This

callable.isInstance = isInstance

callable.resolveInstance = resolveInstance

callable.$$constructor = $$constructor

//// Exports ////

export default callable

export {
    callable,
    Callable,
}
