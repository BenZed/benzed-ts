import { keysOf, nil, Property } from '@benzed/util'
import { Struct } from '../struct'

import { getState, isScalarState } from './get-state'

import {
    $$state,
    State,
    StateGetter,
    StateSetter
} from './state'

//// Helper ////

function getStateDescriptor<T extends Struct>(struct: T): PropertyDescriptor | nil {

    for (const proto of Property.eachPrototype(struct)) {
        const stateDescriptor = Property.descriptorOf(proto, $$state)
        if (stateDescriptor)
            return stateDescriptor
    }

    return nil
}

//// Exports ////

export function hasStateGetter<T = object>(struct: Struct): struct is Struct & StateGetter<T> {
    const stateDescriptor = getStateDescriptor(struct)
    if (!stateDescriptor)
        return false

    return 'value' in stateDescriptor || !!stateDescriptor.get
}

/**
 * Returns true if the given struct has bespoke state
 * application logic.
 */
export function hasStateSetter<T = object>(struct: Struct): struct is Struct & StateSetter<T> {
    const stateDescriptor = getStateDescriptor(struct)
    return stateDescriptor?.writable ?? !!stateDescriptor?.set
}

export function setKeyEnumerable<T extends Struct>(struct: T, enumerable: boolean, stateKeys: (keyof T)[]): void {

    const state = getState(struct)

    for (const stateKey of stateKeys as (string | symbol)[]) {

        if (!enumerable && stateKey in state === false)
            throw new Error(`${String(stateKey)} is not a valid key in struct ${struct}`)

        const description = Property
            .descriptorOf(struct, stateKey) ?? 
            { writable: true, configurable: true }

        Property.define(
            struct,
            stateKey,
            {
                ...description,
                enumerable
            }
        )
    }

}

export function matchKeyVisibility<T extends Struct>(source: T, target: T): void {

    const state = getState(source)
    
    // Scalar states would have no key visibility to share
    if (isScalarState(state))
        return

    for (const stateKey of keysOf(state)) {

        const aDescriptor = Property.descriptorOf(source, stateKey as string | symbol)
        if (!aDescriptor)
            throw new Error(`${String(stateKey)} is not a valid key in struct ${source}`)

        const { enumerable } = aDescriptor

        setKeyEnumerable(target, enumerable ?? true, [stateKey as unknown as keyof T])
    }
}

/**
 * Turn on enumerability of the provided struct keys.
 */
export function showStateKeys<T extends Struct>(struct: T, ...keys: (keyof State<T>)[]): void {
    setKeyEnumerable(struct, true, keys as (keyof T)[])
}

/**
 * Turn off enumerability of the provided struct keys.
 */
export function hideNonStateKeys<T extends Struct>(struct: T, ...keys: (string | symbol)[]): void {
    setKeyEnumerable(struct, false, keys as (keyof T)[])
}
