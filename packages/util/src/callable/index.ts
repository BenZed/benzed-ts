import createCallableObject, { Callable, CallableSignature } from './object'
import createCallableClass, { isClass, Class, CallableClass } from './class'
import { Func } from '../types'

//// Main ////

function callable<S extends CallableSignature<InstanceType<C>>, C extends Class>(
    signature: S,
    constructor: C,
    name?: string
): CallableClass<S, C>

function callable<S extends CallableSignature<O>, O extends object>(
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
            name
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

//// Exports ////

export default callable

export {
    callable,
    Callable
}