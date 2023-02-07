import { isFunc, isRecord, keysOf } from '@benzed/util'

import Struct from '../struct'
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
export function getState<T extends Struct>(struct: T): State<T> {
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

    const state = getState(struct) as any

    if (!isScalarState(state)) {
        for (const key of keysOf(state)) {
            if (Struct.is(state[key])) 
                state[key] = getDeepState(state[key])
        }
    }

    return state
}

export function isScalarState(input: unknown): boolean {
    return (
        !isRecord(input) &&
        !isFunc(input)
    )
}

