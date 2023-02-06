import { GenericObject } from '@benzed/util'

import { copy } from '../../copy'
import { Struct } from '../struct'
import { setState } from './set-state'

import { 
    State,
    StateApply,
    StateDeepApply
} from './state'

//// Exports ////

/**
 * Given a struct, a path and a state at that path, receive a new struct
 * with the state applied at that path.
 */
export function applyDeepState<T extends Struct, P extends StateDeepApply<T>>(
    struct: T, 
    ...params: P
): T {

    const [ state, ...keys ] = [...params].reverse() as P as [unknown, ...(string | symbol)[]]

    // create deep state from params
    let deepState = state as GenericObject
    for (const key of keys) 
        deepState = { [key]: deepState }

    return applyState(struct, deepState as StateApply<T>)
}

/**
 * Given a struct and state, receive a new struct with 
 * the state applied.
 */
export function applyState<T extends Struct>(
    struct: T, 
    state: StateApply<T>
): T {

    const newStruct = copy(struct)
    setState(newStruct, state as State<T>)
    return newStruct

}