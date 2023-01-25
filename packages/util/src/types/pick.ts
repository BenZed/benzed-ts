import { isObject } from './guards'
import { KeysOf } from './keys-of'

//// Helper ////

function _pick(input: object, ...keys: (keyof object)[]): object {

    const output: object = {}

    for (const key of keys) {
        if (key in input)
            output[key] = input[key]
    }

    return output
}

//// Implementation ////

export function pick<T extends object, Tk extends KeysOf<T>[]>(...keys: Tk): (input:T) => Pick<T, Tk[number]>
export function pick<T extends object, Tk extends KeysOf<T>[]>(input: T, ...keys: Tk): Pick<T, Tk[number]>
export function pick(input: object, ...keys: string[]): object

export function pick(...input: unknown[]): unknown {
    if (isObject(input))
        return _pick(...input as [object, ...(keyof object)[]])
    
    return (o: object) => _pick(o, ...input as (keyof object)[])
}