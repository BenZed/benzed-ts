import { isObject } from './guards'

//// Helper ////

function _pick(input: object, ...keys: (keyof object)[]): object {

    const output: object = {}

    for (const key of keys) 
        output[key] = input[key]

    return output
}

//// Implementation ////

export function pick<T extends object, Tk extends (keyof T)[]>(input: T, ...keys: Tk): Pick<T, Tk[number]>
export function pick<T extends object, Tk extends (keyof T)[]>(...keys: Tk): (input:T) => Pick<T, Tk[number]>
export function pick(input: object, ...keys: (string | symbol)[]): object
export function pick(...input: unknown[]): unknown {
    if (isObject(input[0]))
        return _pick(...input as unknown as [object, ...(keyof object)[]])
    
    return (o: object) => _pick(o, ...input as (keyof object)[])
}