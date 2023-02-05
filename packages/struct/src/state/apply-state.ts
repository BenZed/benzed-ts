import { isObject } from '@benzed/util'

import { copyWithoutState } from '../struct'

import { getShallowState } from './get-state'
import { setState } from './set-state'

import { 
    AnyState, 
    StateApply, 
    StatePathApply, 
    StatePaths 
} from './state'

import { matchKeyVisibility } from './state-keys'

//// Exports ////

/**
 * Given a struct and state, receive a new struct with the state applied.
 */
export function applyState<T extends AnyState>(struct: T, state: StateApply<T>): T 
export function applyState<T extends AnyState, P extends StatePaths<T>>(
    struct: T, 
    ...deepState: StatePathApply<T, P>
): T 
export function applyState(struct: AnyState, ...args: unknown[]): AnyState {

    const previousState = getShallowState(struct)
    const newStruct = copyWithoutState(struct)
    // first apply old state, in case of nested structs
    setState(newStruct, previousState)

    // Nest state if it is being deeply set
    let state = args.pop()
    const deepKeys = args.reverse() as (keyof AnyState)[]
    for (const deepKey of deepKeys) 
        state = { [deepKey]: state }

    // apply state again, mixed so that any nested structs
    if (isObject(state)) 
        setState(newStruct, { ...previousState, ...state as object })
    else 
        throw new Error('Scalar state not yet implemented.')

    matchKeyVisibility(struct, newStruct)

    return newStruct
}