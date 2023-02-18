import { assign, each, isObject, Trait } from '@benzed/util'

import { Stateful, StateOf } from './stateful'

import { Comparable } from '../comparable'
import equals from '../../equals'

import { Copyable } from '../copyable'
import copy from '../../copy'

//// Types ////

export type DeepStateOf<T extends Stateful> = T[typeof Stateful.key] extends infer S 
    ? S extends object 
        ? {
            [K in keyof S]: S[K] extends Stateful 
                ? DeepStateOf<S[K]>
                : S[K]
        }
        : S
    : never

export type DeepStateUpdate<T extends Stateful> = T[typeof Stateful.key] extends infer S 
    ? S extends object 
        ? Partial<{
            [K in keyof S]: S[K] extends Stateful 
                ? DeepStateUpdate<S[K]>
                : S[K]
        }>
        : never
    : never

//// Main ////

/**
 * The State trait, in combination with the Copyable and Comparable traits,
 * allows trees of objects to be structurally cloned, immutably changing
 * thier state, but leaving their implementations intact.
 */
abstract class State extends Trait.merge(Stateful, Copyable, Comparable) {

    /**
     * Get the deep state of an object, with all of it's nested substates
     * resolved.
     */
    static get<T extends State>(stateful: T): DeepStateOf<T> {

        const state = Stateful.is(stateful) 
        //            ^ kind of hacky, but this lets us call State.get from inside 
        //              a [Stateful.key] getter by using { ...this } as a spread argument 
        //              without pissin off the type system.
            ? stateful[Stateful.key] as T
            : stateful

        for (const key of each.keyOf(state)) {
            const value = state[key]
            if (value instanceof Stateful)
                state[key] = value[Stateful.key] as typeof value
        }
    
        return state as DeepStateOf<T>
    }

    /**
     * Deep set a stateful object with a partial or full state update.
     */
    static set<T extends State>(state: T, update: DeepStateUpdate<T>) {

        if (!isObject(update))
            throw new Error('May only deep set object states.')

        for (const [key, subUpdate] of each.entryOf(update)) {
            const subState = state[key as keyof T]
            update[key] = (State.is(subState)
                ? State.apply(subState as T, subUpdate)
                : subUpdate) as typeof subUpdate
        }

        if (Stateful.is(state))
        //              ^ like the get method, we've got this 
        //                check as a typesafe backdoor to call
        //                the State.set method from within it's 
        //                own State[key] set() implementation:
        //                assign(this, set({ ...this }, state)
            state[Stateful.key] = update
        else 
            assign(state, update)

        return state
    }

    /**
     * Copy a stateful object and apply a new state to it's clone.
     */
    static override apply<T extends State>(original: T, state: StateOf<T>): T {
        const clone = copy(original)
        clone[Stateful.key] = state
        return clone
    }

    //// Copyable ////

    /**
     * State trait assumes no logic in the constructor.
     * If there *is* logic in the constructor, the Copyable.copy
     * method should be overridden to include constructor logic
     * after a copy.
     */
    protected [Copyable.copy](): this {
        const clone = Object.create(this.constructor.prototype)
        clone[Stateful.key] = this[Stateful.key]
        return clone
    }

    //// Comparable ////
    
    /**
     * If another State object has the same constructor and
     * a value equal state, it's considered equal.
     */
    protected [Comparable.equals](other: unknown): other is this {
        return State.is(other) && 
            other.constructor === this.constructor && 
            equals(other[Stateful.key], this[Stateful.key])
    }

}

//// Exports ////

export default State

export {
    State,
    Stateful
}