
import property from '../property'
import { Func, isFunc } from '../types'

import { resolveInstance } from './class'
import createCallableObject from './object'

//// Type ////

type CallableConstructor = abstract new <F extends Func>(f: F) => F

interface Callable extends CallableConstructor {

    // Get the object nested within the callable function
    resolve: typeof resolveInstance

    // Create a generic callable instance from a function and an object
    create: typeof createCallableObject

}

//// Main ////

/**
 * An extendable class with a call signature
 */
const Callable = class {

    static resolve = resolveInstance

    static create = createCallableObject

    static [Symbol.hasInstance](value: unknown): boolean {

        const instance = resolveInstance(value as object)
        if (!isFunc(instance?.constructor))
            return false 

        if (Object.is(instance.constructor, this))
            return true

        if (property.prototypesOf(instance.constructor).includes(this)) 
            return true 

        return false
    }

    constructor(func: Func) {
        return Callable.create(func, this)
    }

} as Callable

//// Exports ////

export default Callable

export {
    Callable
}