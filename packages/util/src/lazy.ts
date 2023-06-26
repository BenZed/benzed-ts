
import { PrivateState } from '../classes'
import { GenericObject } from '../types'

//// Main ////

/**
 * get a lazily initialized value for an object
 * @param object
 * @param key - backing property key for the object value
 * 
 */
function lazy<T>(object: object, key: PropertyKey, initializer: () => T): T {

    const lazyState = PrivateState.for(lazy)
    if (!lazyState.has(object))
        lazyState.set(object, {})

    const state = lazyState.get(object) as GenericObject
    if (key in state === false) 
        state[key] = initializer()
    
    return state[key] as T
}

//// Exports ////

export default lazy

export {
    lazy
}