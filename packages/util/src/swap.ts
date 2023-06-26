import { AsMutable } from '../types'

//// Types ////

type MutableKeys<O extends object> = keyof AsMutable<O>

type ValueEqualMutableKeys<O extends object, K extends keyof O> = keyof AsMutable<{
    [Ok in keyof O as 
    O[K] extends O[Ok] // same value 
        ? Ok
        : never
    ]: O[Ok]
}>

//// Main ////
    
/**
 * Swap two keys of a mutable object
 */
function swap<
    O extends object, 
    F extends MutableKeys<O>,
    T extends ValueEqualMutableKeys<O, F>
>(object: O, from: F, to: T): O {

    const f = from as keyof O
    const t = to as keyof O

    const value = object[f]
    object[f] = object[t]
    object[t] = value

    return object
}

//// Exports ////

export default swap

export {
    swap
}