import { assign, isObject, keysOf } from '@benzed/util'

import { applyState } from './apply-state'

import {
    $$state,
    State
} from './state'

import { Struct } from '../struct'
import { hasStateSetter } from './state-keys'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
*/

//// Helper ////

/**
 * Given the deep state of a struct, apply all substates to 
 * structs in the state, as opposed to over-writing them.
 */
export function setDeepState<T extends Struct>(struct: T, state: State<T>): void {

    if (!isObject(state))
        throw new Error('Cannot deep-set a scalar state.')

    for (const key of keysOf(state)) {

        const structKey = key as unknown as keyof typeof struct
        const structValue = struct[structKey] as unknown
        const stateValue = state[key] as unknown

        const stateValueIsStructState =
            !(stateValue instanceof Struct) &&
            structValue instanceof Struct

        if (stateValueIsStructState) {
            state[key] = applyState(
                structValue, 
                stateValue as object
            )
        }
    }

    assign(struct, state)
}

/**
 * Over-write the state of a struct without creating a copy of it.
 */
export function setState<T extends Struct>(struct: T, state: State<T>): void {

    if (hasStateSetter(struct))
        struct[$$state] = state
    else
        setDeepState(struct, state)

}

