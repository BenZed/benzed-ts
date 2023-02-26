import { 
    AnyTypeGuard, 
    each, 
    GenericObject, 
    Infer, 
    isIntersection, 
    isObject, 
    isShape 
} from '@benzed/util'

import { Trait } from '@benzed/traits'

import { Stateful, StateOf } from './stateful'

import { equals, Comparable } from './comparable'
import { copy, Copyable } from './copyable'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper Types ////

type _ToState<T extends object> = T extends Stateful 
    ? StateOf<T> 
    : T

type _DeepState<T> = T extends object 
    ? Infer<{
        [K in keyof _ToState<T>]: _ToState<T>[K] extends Stateful 
            ? _DeepState<_ToState<T>[K]> 
            : _ToState<T>[K]
    }, object>
    : T

type _PartialDeepState<T> = T extends object 
    ? Infer<{
        [K in keyof _ToState<T>]?: _ToState<T>[K] extends Stateful 
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

type _StructAtPath<T, P extends unknown[]> =
    P extends [infer P1, ...infer Pr]
        ? P1 extends keyof T
            ? _StructAtPath<T[P1], Pr>
            : never
        : T extends Structural 
            ? T 
            : _DeepState<T>

type _PartialStateAtPath<T, P extends unknown[]> =
    P extends [infer P1, ...infer Pr]
        ? P1 extends keyof T
            ? _PartialStateAtPath<T[P1], Pr>
            : never
        : _PartialDeepState<T>

//// Types ////

type StructStatePath = PropertyKey[]

type StructStateApply<T extends Structural, P extends StructStatePath = []> = 
    _PartialStateAtPath<StateOf<T>, P>

type StructStateUpdate<T extends Structural, P extends StructStatePath = []> = 
    (prev: _StructAtPath<T, P>) => _PartialStateAtPath<StateOf<T>, P>

type StructState<T extends Structural, P extends StructStatePath = []> = 
    _StateAtPath<StateOf<T>, P> 

//// Main ////

/**
 * A Structural object is an immutable stateful object with static methods
 * for deeply getting and setting state. 
 * 
 */
abstract class Structural extends Trait.merge(Stateful, Copyable, Comparable) {

    static getStructIn<T extends Structural, P extends StructStatePath>(
        struct: T,
        ...path: P
    ): _StructAtPath<T, P> {

        let state = struct[Stateful.key]

        // resolve state at path
        for (const subPath of path) {
            if (!isObject(state) || !(subPath in state)) 
                throw new Error(`Invalid state at path: ${String(subPath)}`)
            
            state = state[subPath as keyof typeof state]
        }

        // get nested states
        if (isObject(state) && !this.is(state)) {
            //                  ^ unless the current state IS a struct.
            for (const key of each.keyOf(state)) {
                const value = state[key]
                if (this.is(value))
                    state[key] = this.getIn(value) as typeof value
            }
        }

        return state as _StructAtPath<T, P>
    }

    /**
     * Given a struct, resolve the state of that struct by recursively
     * resolving the state of any nested sub structs.
     */
    static getIn<T extends Structural, P extends StructStatePath>(
        struct: T, 
        ...path: P
    ): StructState<T, P> {
        
        const structAtPath = this.getStructIn(struct, ...path)

        return (Stateful.is(structAtPath) 
            ? this.getIn(structAtPath) 
            : structAtPath) as StructState<T, P>
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
        let partialState = newStateAtPath as GenericObject
        for (const subPath of path) 
            partialState = { [subPath]: partialState }

        const state = struct[Stateful.key]

        // deep set state, triggering nested struct state setters
        for (const key of each.keyOf(partialState)) {
            const prevKey = key as keyof typeof state
            if (
                prevKey in state && 
                this.is(state[prevKey]) && 
                !this.is(partialState[key])
            ) {
                partialState[key] = this.apply(
                    state[prevKey], 
                    partialState[key] as never // <- shut up, ts
                )
            }
        }

        struct[Stateful.key] = { ...state, ...partialState }
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

    static update<T extends Structural, P extends StructStatePath>(
        original: T,
        ...params: [ ...P, StructStateUpdate<T, P> ]
    ): T {
        const [ update, ...path ] = params.reverse() as [ StructStateUpdate<T, P>, ...P ]
        path.reverse() // undo that ------^

        const prev = this.getStructIn(original, ...path)
        return this.apply(original, ...path as P, update(prev))
    }

    static override is: (input: unknown) => input is Structural = 
        isIntersection(
            Comparable.is,
            Copyable.is as AnyTypeGuard,
            isShape({
                [Structural.key]: isObject
            })
        )

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
        const clone = Copyable.createFromProto(this)
        clone[Stateful.key] = copy(this[Stateful.key])
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
    StructStateUpdate,
    StructStatePath
}