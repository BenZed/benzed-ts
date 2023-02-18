
import { State } from './state'

import { equals, Comparable } from './comparable'
import { copy, Copyable } from './copyable'

import { AnyTypeGuard, each, isIntersection, isKeyed, pick } from '@benzed/util'
import { Trait } from '@benzed/traits'

//// Types ////

export type StructState<T extends Struct> = T[typeof $$stateKeys] extends infer S
    ? S extends (keyof T)[]
        ? {
            [K in S[number]]: T[K] extends Struct 
                ? StructState<T[K]>
                : T[K]
        } 
        : never
    : never

export type StructStateUpdate<T extends Struct> = T[typeof $$stateKeys] extends infer S
    ? S extends (keyof T)[]
        ? Partial<{
            [K in S[number]]: T[K] extends Struct 
                ? StructStateUpdate<T[K]>
                : T[K]
        }>
        : never
    : never

//// Helper ////

function getStateKeys<T extends Struct>(struct: T): (keyof T)[] {
    
    const keys = struct[$$stateKeys]
    void each(keys).do(k => {
        const key = k as PropertyKey
        if (key in struct === false)
            throw new Error(`${String(key)} is not a valid key for ${struct}`)
    })

    return keys as (keyof T)[]

}

//// Main ////

const $$stateKeys = Symbol('struct-state-keys')

/**
 * The Struct trait is Copyable, Comparable and Stateful. 
 * 
 */
abstract class Struct extends Trait.merge(State, Copyable, Comparable) {

    static stateKeys: typeof $$stateKeys = $$stateKeys

    static override is: (input: unknown) => input is Struct =
        isIntersection(
            isKeyed($$stateKeys) as AnyTypeGuard,
            State.is,
            Copyable.is,
            Comparable.is
        )

    /**
     * Copy a stateful object and apply a new state to it's clone.
     */
    static override apply<T extends Struct>(original: T, state: StructStateUpdate<T>): T {
        const clone = copy(original)
        clone[State.key] = state
        return clone
    }

    //// Copyable ////

    abstract get [$$stateKeys](): PropertyKey[] | readonly PropertyKey[]

    get [State.key](): StructState<this> {

        const state = pick(this, ...getStateKeys(this))

        for (const [ key, value ] of each.entryOf(state)) {
            if (State.is(value))
                state[key] = State.get(value) as typeof value
        }
    
        return state as unknown as StructState<this>
    }

    set [State.key](state: StructState<this>) {
        for (const key of getStateKeys(this)) {
            if (!(key in state))
                continue

            const subStruct = this[key]
            const subState = state[key]

            this[key] = Struct.is(subStruct)
                ? Struct.apply(subStruct, subState)
                : subState
        }
    }

    /**
     * State trait assumes no logic in the constructor.
     * If there *is* logic in the constructor, the Copyable.copy
     * method should be overridden to include constructor logic
     * after a copy.
     */
    protected [Copyable.copy](): this {
        
        const clone = Object.create(this.constructor.prototype)

        clone[State.key] = pick(this, ...getStateKeys(this))
        //                 ^ set shallow state

        return clone
    }

    //// Comparable ////
    
    /**
     * If another State object has the same constructor and
     * a value equal state, it's considered equal.
     */
    protected [Comparable.equals](other: unknown): other is this {
        return Struct.is(other) && 
            other.constructor === this.constructor && 
            equals(other[State.key], this[State.key])
    }

}

//// Exports ////

export default Struct

export {
    Struct
}