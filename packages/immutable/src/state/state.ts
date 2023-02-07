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

type _StateAtPath<T, P extends SubStatePath> = P extends [infer P1, ...infer Pr]
    ? P1 extends _StateKeys<T>
        ? Pr extends SubStatePath 
            ? _StateAtPath<T[P1], Pr>
            : T[P1]
        : never
    : T extends StateFul<infer S> 
        ? _StateApply<S>
        : _StateApply<T>

//// Types ////

/**
 * An object with state
 */
interface StateFul<T> { 
    [$$state]: T
}

interface StateSetter<T> {
    set [$$state](value: T)
}

interface StateGetter<T> {
    get [$$state](): T
}

type State<T extends Struct> = T extends StateFul<infer S>
    ? _State<S> 
    : Empty

type StateApply<T extends Struct> = T extends StateFul<infer S>
    ? _StateApply<S> 
    : Empty

type SubState<T extends Struct, P extends SubStatePath> = T extends StateFul<infer S>
    ? _StateAtPath<S, P>
    : Empty

type SubStateApply<T extends Struct, P extends SubStatePath> = [
    ...P,
    SubState<T,P>
]

type SubStatePath = (string | symbol)[] | readonly (string | symbol)[]

//// Exports ////

export {

    State,
    StateFul,
    StateGetter,
    StateSetter,
    StateApply,

    SubState,
    SubStateApply,
    SubStatePath,
    $$state,

}