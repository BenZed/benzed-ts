import { each, isObject } from '@benzed/util'

import Struct from '../struct'

import { hasStateGetter } from './state-keys'

import { 
    $$state, 
    State, 
    SubStatePath 
} from './state'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Exports ////

/**
 * Retreive the shallow state of a struct
 */
export function getShallowState<T extends Struct>(struct: T): State<T> {
    const state = hasStateGetter(struct)
        ? struct[$$state]
        : { ...struct }

    return state as State<T>
}

/**
 * Retreive the state of a struct
 * Any structs that exist in the state of the source struct will
 * be converted into their own state.
 */
export function getDeepState<T extends Struct>(struct: T): State<T> {

    const state = getShallowState(struct) as any

    if (isObject(state)) {
        for (const key of each.keyOf(state)) {
            if (Struct.is(state[key])) 
                state[key] = getDeepState(state[key])
        }
    }

    return state
}

/**
 * Retreive the state of a struct at a given state path.
 * Substructs will be converted into their own state.
 */
export function getState<T extends Struct, P extends SubStatePath>(struct: T, ...path: P): State<T,P> {

    let subState = getDeepState(struct)

    for (const subPath of path) {
        if (!isObject(subState))
            throw new Error(`Invalid path: ${String(subPath)} at scalar sub state`)

        subState = subState[subPath as keyof State<T>]
    }

    return subState as unknown as State<T,P>
}
