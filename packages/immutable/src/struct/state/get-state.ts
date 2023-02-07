import { isFunc, isObject } from '@benzed/util'

import Struct from '../struct/struct'
import { getNamesAndSymbols } from '../util'
import { hasStateGetter } from './state-keys'
import { $$state, State } from './state'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Main ////

/**
 * Receive the state of the struct.
 */
export function getShallowState<T extends Struct>(struct: T): State<T> {
    const state = hasStateGetter(struct)
        ? struct[$$state]
        : { ...struct }

    return state as State<T>
}

/**
 * Retreive the state of an object.
 * Any structs that exist in the state of the source struct will
 * be converted into their own state.
 */
export function getDeepState<T extends Struct>(struct: T): State<T> {
    
    const state = getShallowState(struct) as any
    if (isScalarState(state))
        return state // scalar states are as deep as they got

    for (const key of getNamesAndSymbols(state)) {
        if (state[key] instanceof Struct) 
            state[key] = getDeepState(state[key])
    }

    return state

}

export function isScalarState(input: unknown): boolean {
    return !isObject(input) && !isFunc(input)
}

