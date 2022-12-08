import { nil } from './nil'
import { keysOf } from './keys-of'
import { Infer } from './types'

//// Type ////

type Defined<T extends object> = Infer<{
    [K in keyof T as T[K] extends undefined ? never : K]: T[K]
}>

//// Main ////

/**
 * Get a shallow copy of the input object that only contains
 * defined keys
 */
function defined<T extends object>(input: T): Defined<T> {
    const output = {} as T
    for (const key of keysOf(input)) {
        if (input[key] !== nil)
            output[key] = input[key]
    }
            
    return output as Defined<T>
}       

//// Exports ////

export default defined

export {
    defined,
    Defined
}