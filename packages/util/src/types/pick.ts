import { Keys } from './types'

//// Helper ////

function _pick(input: object, ...keys: Keys): object {

    const output: object = {}

    for (const key of keys)
        output[key] = input[key]

    return output
}

//// Implementation ////

export function pick<T extends object, Tk extends Keys<T>>(...keys: Tk): (input:T) => Pick<T, Tk[number]>
export function pick<T extends object, Tk extends Keys<T>>(input: T, ...keys: Tk): Pick<T, Tk[number]>

export function pick(...input: unknown[]): unknown {
    if (typeof input[0] === 'object')
        return _pick(...input as [object, ...Keys])
    
    return (o: object) => _pick(o, ...input as Keys)
}