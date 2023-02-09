import { Empty, Infer } from '@benzed/util'
import { $$copy } from '../copy'
import { $$equals } from '../equals'
import { Struct } from '../struct'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

/**
 * Struct state symbol
 */
const $$state = Symbol('state')

//// Helper Types ////

type _StateKeys<T> = Exclude<keyof T, typeof $$state | typeof $$copy | typeof $$equals>

type _State<T> = T extends object 
    ? Infer<{
        [K in _StateKeys<T>]: T[K] extends Struct
            ? State<T[K]>
            : T[K]
    }, object>
    : T 

type _StateApply<T> = T extends object
    ? Partial<{
        [K in _StateKeys<T>]: T[K] extends Struct
            ? StateApply<T[K]>
            : T[K]
    }>
    : T

type _StateApplyAtPath<T, P extends unknown[] | readonly unknown[]> = 
    P extends [infer P1, ...infer Pr]
        ? P1 extends _StateKeys<T>
            ? _StateApplyAtPath<T[P1], Pr>
            : never
        : T extends StateFul<infer S> 
            ? _StateApply<S>
            : _StateApply<T>

type _StateAtPath<T, P extends unknown[] | readonly unknown[]> =
    P extends [infer P1, ...infer Pr]
        ? P1 extends _StateKeys<T>
            ? _StateAtPath<T[P1], Pr>
            : never
        : T extends StateFul<infer S> 
            ? _State<S>
            : _State<T>

//// Types ////

/**
 * An object with state
 */
interface StateFul<T> { 
    [$$state]: T
}

/**
 * An object with a state setter
 */
interface StateSetter<T> {
    set [$$state](value: T)
}

/**
 * An object with a state getter
 */
interface StateGetter<T> {
    get [$$state](): T
}

type State<T extends Struct, P extends SubStatePath = []> = T extends StateFul<infer S>
    ? _StateAtPath<S, P>
    : Empty

type StateApply<T extends Struct, P extends SubStatePath = []> = T extends StateFul<infer S>
    ? _StateApplyAtPath<S, P>
    : Empty

type SubStatePath = (string | symbol)[] | readonly (string | symbol)[]

//// Exports ////

export {

    State,
    StateApply,

    SubStatePath,

    StateFul,
    StateGetter,
    StateSetter,
    $$state,

}