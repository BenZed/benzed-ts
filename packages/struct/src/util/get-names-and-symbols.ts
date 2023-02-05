import { keysOf, symbolsOf } from '@benzed/util'

//// Eslint ////

export function getNamesAndSymbols(object: object): Set<symbol | string> {
    return new Set([
        ...keysOf(object),
        ...symbolsOf(object)
    ])
}
