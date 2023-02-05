import { Callable, isFunc, nil } from '@benzed/util'
import { AnyState } from '../state'
import { applySignature } from '../util'

//// Exports ////

/**
 * Create a clone of a struct without applying any state
 */
export function copyWithoutState<T extends AnyState>(struct: T): T {
    
    const newStruct = Object.create(struct.constructor.prototype)

    const signature = isFunc(struct)
        ? Callable.signatureOf(struct)
        : nil

    return applySignature(newStruct, signature)
}
