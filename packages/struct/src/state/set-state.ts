import { assign, keysOf } from '@benzed/util'

import { applyState } from './apply-state'
import { Struct } from '../struct/struct'
import { getStateDescriptor } from './state-keys'
import { $$state, State } from './state'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Exports ////

/**
 * Over-write the state of a struct without creating a copy of it.
 */
export function setState<T extends Struct>(struct: T, state: State<T>): void {

    const stateDescriptor = getStateDescriptor(struct)

    if (stateDescriptor?.writable || stateDescriptor?.set)
        (struct as any)[$$state] = state

    else {
        for (const key of keysOf(state)) {
            const structKey = key as unknown as keyof typeof struct
            const structValue = struct[structKey] as unknown
            const stateValue = state[key] as unknown
            if (
                !(stateValue instanceof Struct) && 
                structValue instanceof Struct
            ) {
                state[key] = applyState(
                    structValue, 
                    stateValue as object
                )
            }
        }
        assign(struct, state)
    }
}

