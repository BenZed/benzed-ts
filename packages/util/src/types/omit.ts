import { Keys } from './types'
import { keysOf } from '../iterate'

//// Helper ////

function _omit(input: object, ...keys: Keys): object {
    const output: object = {}

    for (const key of keysOf(input)) {
        if (!keys.includes(key))
            output[key] = input[key]
    }

    return output
}

//// Implementation ////

export function omit<T extends object, Tk extends Keys<T>>(...keys: Tk): (input: T) => Omit<T, Tk[number]>
export function omit<T extends object, Tk extends Keys<T>>(input: T, ...keys: Tk): Omit<T, Tk[number]>

export function omit(...input: unknown[]): unknown {
    return typeof input[0] === 'object' 
      
        ? _omit(...input as [object, ...Keys])
        
        : (i: object) => _omit(i, ...input as Keys)
}
