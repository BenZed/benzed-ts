
import Struct from '../struct/struct'
import { getNamesAndSymbols } from '../util'
import { getStateDescriptor } from './state-keys'
import { AnyState, $$state, State } from './state'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper ////

function getState<T extends AnyState>(input: T, deep: boolean): State<T> {

    const stateDescriptor = getStateDescriptor(input)

    const output = stateDescriptor && (stateDescriptor.value || stateDescriptor.get)
        ? (input as any)[$$state]
        : { ...input }

    if (deep) {
        for (const key of getNamesAndSymbols(output)) {
            if (output[key] instanceof Struct) 
                output[key] = getState(output[key], deep)
        }
    }

    return output
}

//// Main ////

function getShallowState<T extends AnyState>(struct: T): State<T> {
    return getState(struct, false)
}

/**
 * Retreive the deep state of a struct.
 */
function getDeepState<T extends AnyState>(struct: T): State<T> {
    return getState(struct, true)
}

//// Exports ////

export {
    getShallowState,
    getDeepState
}