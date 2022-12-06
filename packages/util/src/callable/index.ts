import createCallableObject, { bind$$This, Callable, BoundSignature, get$$This, transfer$$This } from './object'
import createCallableClass, { isClass, Class, CallableClass } from './class'

import type { Func} from '../types'

//// Main ////

function callable<S extends BoundSignature<InstanceType<C>>, C extends Class>(
    signature: S,
    constructor: C,
    name?: string,
): CallableClass<S, C>

function callable<S extends BoundSignature<O>, O extends object>(
    signature: S,
    object: O,
    name?: string
): Callable<S,O>

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
            objectOrConstructor, 
            { 
                name: {
                    value: name, 
                    configurable: true 
                }
            }
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

//// Exports ////

export default callable

export {
    callable,
    Callable
}