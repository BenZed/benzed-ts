
import Struct from '../struct/struct'
import { getNamesAndSymbols } from '../util'
import { getStateDescriptor } from './state-keys'
import { $$state, State } from './state'
import { isObject } from '@benzed/util'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper ////

function getState<T extends Struct>(struct: T, deep: boolean): State<T> {

    const stateDescriptor = getStateDescriptor(struct)

    const state = stateDescriptor && ('value' in stateDescriptor || stateDescriptor.get)
        ? (struct as any)[$$state]
        : { ...struct }

    const isScalarState = !isObject<any>(state)
    if (!isScalarState && deep) {
        for (const key of getNamesAndSymbols(state)) {
            if (state[key] instanceof Struct) 
                state[key] = getState(state[key], deep)
        }
    }

    return state
}

//// Main ////

function getShallowState<T extends Struct>(struct: T): State<T> {
    return getState(struct, false)
}

/**
 * Retreive the deep state of a struct.
 */
function getDeepState<T extends Struct>(struct: T): State<T> {
    return getState(struct, true)
}

//// Exports ////

export {
    getShallowState,
    getDeepState
}