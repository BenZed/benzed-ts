import { isObject } from '@benzed/util'
import { getDeepState, AnyState } from '../state'
import { getNamesAndSymbols } from '../util'

//// Helper ////

function stateEquals(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) 
        return true 

    if (!isObject(a) || !isObject(b))
        return false

    const namesAndSymbols = getNamesAndSymbols(a)
    if (namesAndSymbols.size !== getNamesAndSymbols(b).size)
        return false 

    for (const nameOrSymbol of namesAndSymbols) {
        if (!stateEquals(
            a[nameOrSymbol as keyof typeof a],
            b[nameOrSymbol as keyof typeof b]
        ))
            return false
    }

    return true
}

//// Exports ////

/**
 * Do two structs have the same constructor and state?
 */
export function equals<T extends AnyState>(a: T, b: AnyState): b is T {
    return (
        b.constructor === a.constructor &&
        stateEquals(
            getDeepState(a),
            getDeepState(b)
        )
    )
}