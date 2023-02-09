import { namesOf, symbolsOf } from './keys-of'

//// Helper ////

function _omit(input: object, ...keys: (symbol | string)[]): object {
    const output: object = {}

    for (const key of namesOf(input)) {
        if (!keys.includes(key))
            output[key] = input[key]
    }

    for (const symbol of symbolsOf(input)) {
        if (!keys.includes(symbol))
            output[symbol] = input[symbol]
    }

    return output
}

//// Implementation ////

export function omit<T extends object, Tk extends (keyof T)[]>(input: T, ...keys: Tk): Omit<T, Tk[number]>
export function omit<T extends object, Tk extends (keyof T)[]>(...keys: Tk): (input: T) => Omit<T, Tk[number]>
export function omit(input: object, ...keys: (symbol | string)[]): object
export function omit(...input: unknown[]): unknown {
    return typeof input[0] === 'object' 
      
        ? _omit(...input as [object, ...(symbol | string)[]])
        
        : (i: object) => _omit(i, ...input as (symbol | string)[])
}
