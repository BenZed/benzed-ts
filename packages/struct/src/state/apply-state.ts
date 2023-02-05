import { isObject } from '@benzed/util'

import { copyWithoutState, Struct } from '../struct'

import { getShallowState } from './get-state'
import { setState } from './set-state'

import { 
    State,
    StateApply, StatePathApply, 
} from './state'

import { matchKeyVisibility } from './state-keys'

//// Exports ////

/**
 * Given a struct and state, receive a new struct with the state applied.
 */
export function applyState<T extends Struct>(struct: T, ...deep: StatePathApply<T>): T
export function applyState<T extends Struct>(struct: T, state: StateApply<T>): T 
export function applyState(struct: Struct, ...args: unknown[]): Struct {

    const previousState = getShallowState(struct)
    const newStruct = copyWithoutState(struct)
    // first apply old state, in case of nested structs
    setState(newStruct, previousState)

    // Nest state if it is being deeply set
    let state = args.pop()
    const deepKeys = args.reverse() as (keyof Struct)[]
    for (const deepKey of deepKeys) 
        state = { [deepKey]: state }

    const isScalarState = !isObject(state)

    // apply state again, mixed so that any nested structs
    setState(
        newStruct, 
        (
            isScalarState
                ? state
                : { ...previousState, ...state as object }
        ) as State<Struct>
    )

    if (!isScalarState)
        matchKeyVisibility(struct, newStruct)

    return newStruct
}