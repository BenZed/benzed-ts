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

        const subStateKey = key as keyof typeof state
        const maybeSubState = state[subStateKey] as any

        const subStructKey = key as keyof typeof struct
        const maybeSubStruct = struct[subStructKey] as any

        const isSubStruct = Struct.is(maybeSubStruct)
        const isSubState = !Struct.is(maybeSubState)

        if (isSubStruct && isSubState) {
            state[subStateKey] = applyState(
                maybeSubStruct,
                maybeSubState
            ) as typeof maybeSubState
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

