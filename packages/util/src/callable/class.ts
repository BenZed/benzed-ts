import { property } from '../property'
import { isObject } from '../types'
import { isFunc } from '../types/func'
import createCallableObject, { BoundSignature, Callable, get$$Callable, GetSignature } from './object'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types,
    @typescript-eslint/restrict-plus-operands
*/

//// Types ////

interface Class {
    new (...args: any[]): any
}

type CallableClass<S extends BoundSignature<InstanceType<C>>, C extends Class> = 
    // class constructor signature with the callable instance return type
    (new (...params: ConstructorParameters<C>) => Callable<S, InstanceType<C>>) & C

//// Helpers ////
    
const createCallableInstance = <S extends BoundSignature<InstanceType<C>>, C extends Class>(
    signature: S, 
    instance: InstanceType<C>
): Callable<S, InstanceType<C>> => {

    const callable = createCallableObject(
        signature, 
        instance
    )

    // Create callable
    return property(
        callable, 
        { 
            constructor: {
                value: instance.constructor,
                writable: true,
                enumerable: false,
                configurable: true,
            }
        }
    ) as Callable<S, InstanceType<C>>
}

const isClass = (input: unknown): input is Class => 
    isFunc(input) 
    && input.prototype
    && Symbol.hasInstance in input

const resolveInstance = (value: object): object => 
    get$$Callable(value)?.object ?? value

function isInstance <T extends Class>(value: unknown, constructor: T): value is InstanceType<T> 
function isInstance (value: unknown, constructor: Function): value is object { 
    
    return (isObject(value) || isFunc(value)) && resolveInstance(value) instanceof constructor
}

/**
 * This syntax works in testing, but breaks after being transpiled in other packages.
 * Unsure why.
 */

function createCallableClass <
    S extends BoundSignature<InstanceType<C>>,
    C extends Class
>(
    signature: S,
    Class: C,
    name?: string,
): CallableClass<GetSignature<S, InstanceType<C>>, C> {

    if (!isClass(Class))
        throw new Error('Input must be a class definition')

    class Callable extends Class {

        static [Symbol.hasInstance](value: object): boolean {
            const instance = resolveInstance(value)
            return super[Symbol.hasInstance](instance)
        }

        constructor(...args: any[]) {
            super(...args)
            return createCallableInstance(
                signature,
                this as InstanceType<C>,
            )
        }
    }

    return property.name(
        Callable, 
        name ?? `Callable${Class.name}`
    ) as any
}

//// Exports ////

export default createCallableClass

export {
    createCallableClass,
    CallableClass,

    Class,
    isClass,
    isInstance,
    resolveInstance
}