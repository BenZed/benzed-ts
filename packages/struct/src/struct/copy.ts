import { applyState, getShallowState, AnyState } from '../state'

/**
 * Create an immutable copy of a struct
 */
export function copy<T extends AnyState>(struct: T): T {
    return applyState(struct, getShallowState(struct))
}

