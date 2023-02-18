import { each, GenericObject, Infer, isObject } from '@benzed/util'
import { Trait } from '@benzed/traits'

import { Stateful, StateOf } from './stateful'

import { equals, Comparable } from './comparable'
import { copy, Copyable } from './copyable'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper Types ////

type _ToState<T extends object> = T extends Structural 
    ? StateOf<T> 
    : T

type _DeepState<T> = T extends object 
    ? Infer<{
        [K in keyof _ToState<T>]: _ToState<T>[K] extends Structural 
            ? _DeepState<_ToState<T>[K]> 
            : _ToState<T>[K]
    }, object>
    : T

type _PartialDeepState<T> = T extends object 
    ? Infer<{
        [K in keyof _ToState<T>]?: _ToState<T>[K] extends Structural 
            ? _PartialDeepState<_ToState<T>[K]> 
            : _ToState<T>[K]
    }, object>
    : T

type _StateAtPath<T, P extends unknown[]> =
    P extends [infer P1, ...infer Pr]
        ? P1 extends keyof T
            ? _StateAtPath<T[P1], Pr>
            : never
        : _DeepState<T>

type _PartialStateAtPath<T, P extends unknown[]> =
    P extends [infer P1, ...infer Pr]
        ? P1 extends keyof T
            ? _PartialStateAtPath<T[P1], Pr>
            : never
        : _PartialDeepState<T>

//// Types ////

type StructStatePath = (string | symbol)[]

type StructStateApply<T extends Structural, P extends StructStatePath = []> = 
    _PartialStateAtPath<StateOf<T>, P>

type StructState<T extends Structural, P extends StructStatePath = []> = 
    _StateAtPath<StateOf<T>, P> 

//// Main ////

/**
 * A Structural object is an immutable stateful object with static methods
 * for deeply getting and setting state. 
 * 
 */
abstract class Structural extends Trait.merge(Stateful, Copyable, Comparable) {

    /**
     * Given a struct, resolve the state of that struct by recursively
     * resolving the state of any nested sub structs.
     */
    static getIn<T extends Structural, P extends StructStatePath>(
        struct: T, 
        ...path: P
    ): StructState<T, P> {

        let state = struct[Stateful.key]

        // resolve state at path
        for (const subPath of path) {
            if (!isObject(state) || !(subPath in state))
                throw new Error(`Invalid state at path: ${String(subPath)}`)
            state = state[subPath as keyof typeof state]
        }

        // deep get states from other nested structs.
        if (isObject(state)) {
            for (const key of each.keyOf(state)) {
                const value = state[key]
                if (this.is(value))
                    state[key] = this.getIn(value) as typeof value
            }
        }

        return state as StructState<T, P>
    }

    /**
     * Given a struct and a state update, apply the state by
     * updating any sub structures with their appropriate nested
     * object state.
     */
    static setIn<T extends Structural, P extends StructStatePath>(
        struct: T, 
        ...params: readonly [ ...P, StructStateApply<T, P> ]
    ): void {

        const [ newStateAtPath, ...path ] = [...params].reverse() as [StructStateApply<T, P>, ...P]

        // resolve state from path and endpoint
        let newState = newStateAtPath as GenericObject
        for (const subPath of path) 
            newState = { [subPath]: newState }

        const prevState = struct[Stateful.key]

        // deep set state, triggering nested struct state setters
        for (const key of each.keyOf(newState)) {
            const prevKey = key as keyof typeof prevState
            if (
                prevKey in prevState && 
                this.is(prevState[prevKey]) && 
                !this.is(newState[key])
            ) {
                newState[key] = this.apply(
                    prevState[prevKey], 
                    newState[key] as never // <- shut up, ts
                )
            }
        }

        struct[Stateful.key] = newState
    }

    /**
     * Copy a stateful object and apply a new state to it's clone.
     */
    static override apply<T extends Structural, P extends StructStatePath>(
        original: T, 
        ...params: [ ...P, StructStateApply<T, P> ]
    ): T {
        const clone = copy(original)
        this.setIn(clone, ...params)
        return clone
    }

    //// Copyable ////

    abstract get [Stateful.key](): object

    abstract set [Stateful.key](state: object)

    /**
     * A struct assumes the only logic in the constructor is
     * setting state.
     * 
     * Extensions that break this convention will have to
     * override this copy method in order to account for them.
     */
    protected [Copyable.copy](): this {
        const clone = Object.create(this.constructor.prototype)
        clone[Stateful.key] = this[Stateful.key]
        return clone
    }

    //// Comparable ////
    
    /**
     * If another Struct has the same constructor and
     * a value equal state, it's considered equal.
     */
    protected [Comparable.equals](other: unknown): other is this {
        return Structural.is(other) && 
            other.constructor === this.constructor && 
            equals(other[Stateful.key], this[Stateful.key])
    }

}

//// Exports ////

export default Structural

export {
    Structural,
    StructState,
    StructStateApply,
    StructStatePath
}