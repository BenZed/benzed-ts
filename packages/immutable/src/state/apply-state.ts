import { GenericObject } from '@benzed/util'

import { copy } from '../copy'
import { Struct } from '../struct'
import { setState } from './set-state'

import {
    State,
    StateApply,
    SubStatePath
} from './state'

//// Exports ////

/**
 * Given a struct, a path and a state at that path, receive a new struct
 * with the state applied at that path.
 */
export function applyState<T extends Struct, P extends SubStatePath>(
    struct: T,
    ...params: [ ...P, StateApply<T,P> ]
): T {

    const [ subState, ...path ] = [...params].reverse() as unknown as [State<T>, ...P]

    // create state from substate and path
    let state = subState as GenericObject
    for (const subPath of path) 
        state = { [subPath]: state }

    // copy struct
    const newStruct = copy(struct)
    
    // set state on copied struct
    setState(newStruct, state as State<T>)
    return newStruct
}

