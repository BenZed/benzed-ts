import { nil, Property } from '@benzed/util'
import { getNamesAndSymbols } from '../util'
import { getShallowState } from './get-state'
import { AnyState, $$state, State } from './state'

//// Exports ////

export function getStateDescriptor<T extends AnyState>(struct: T): PropertyDescriptor | nil {
    return Property.descriptorOf(struct, $$state)
}

export function setKeyEnumerable<T extends AnyState>(struct: T, enumerable: boolean, stateKeys: (keyof T)[]): void {

    const state = getShallowState(struct)

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

export function matchKeyVisibility<T extends AnyState>(source: T, target: T): void {

    const state = getShallowState(source)

    for (const stateKey of getNamesAndSymbols(state)) {

        const aDescriptor = Property.descriptorOf(source, stateKey)
        if (!aDescriptor)
            throw new Error(`${String(stateKey)} is not a valid key in struct ${source}`)

        const { enumerable } = aDescriptor

        setKeyEnumerable(target, enumerable ?? true, [stateKey as unknown as keyof T])
    }
}

/**
 * Turn on enumerability of the provided struct keys.
 */
export function showStateKeys<T extends AnyState>(struct: T, ...keys: (keyof State<T>)[]): void {
    setKeyEnumerable(struct, true, keys as (keyof T)[])
}

/**
 * Turn off enumerability of the provided struct keys.
 */
export function hideNonStateKeys<T extends AnyState>(struct: T, ...keys: (string | symbol)[]): void {
    setKeyEnumerable(struct, false, keys as (keyof T)[])
}
