import { each } from '../../../each/src'
import { isObject } from './guards'

//// Helper ////

function _omit(input: object, ...keys: (symbol | string)[]): object {
    const output: object = {}

    for (const key of each.keyOf(input)) {
        if (!keys.includes(key))
            output[key] = input[key]
    }

    return output
}

//// Implementation ////

export function omit<T extends object, Tk extends (keyof T)[]>(input: T, ...keys: Tk): Omit<T, Tk[number]>
export function omit<T extends object, Tk extends (keyof T)[]>(...keys: Tk): (input: T) => Omit<T, Tk[number]>
export function omit(input: object, ...keys: (symbol | string)[]): object
export function omit(...input: unknown[]): unknown {
    return isObject(input[0])
      
        ? _omit(...input as [object, ...(symbol | string)[]])
        
        : (i: object) => _omit(i, ...input as (symbol | string)[])
}
