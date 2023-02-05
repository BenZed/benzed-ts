import { Empty, Infer } from '@benzed/util'
import { $$struct, Struct } from '../struct'

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

type _State<T> = Infer<{
    [K in keyof T]: T[K] extends Struct
        ? State<T[K]>
        : T[K]
}>

type _StateApply<T> = Partial<{
    [K in keyof T]: T[K] extends Struct
        ? StateApply<T[K]>
        : T[K]
}>

type _StatePathKeys<T> = Exclude<keyof T, typeof $$state | typeof $$struct>

type _StatePaths<T> = {
    [K in _StatePathKeys<T>]: T[K] extends object 
        ? [K] | [K, ..._StatePaths<T[K]>]
        : [K]
}[_StatePathKeys<T>]

export type _StateAtPath<T, P> = P extends [infer P1, ...infer Pr]    
    ? P1 extends keyof T 
        ? T[P1] extends Struct 
            ? Pr extends []
                ? State<T[P1]>
                : _StateAtPath<T[P1], Pr>
            : T[P1]
        : _State<T>
    : never

type _StateFul<T> = { 
    [$$state]: T 
}

//// Types ////

type State<T extends Struct> = T extends _StateFul<infer S>
    ? _State<S>
    : Empty

type StateApply<T extends Struct> = T extends _StateFul<infer S>
    ? _StateApply<S>
    : Empty

type StatePaths<T extends Struct> = T extends _StateFul<infer S>
    ? _StatePaths<S>
    : never

type StateAtPath<T extends Struct, P extends StatePaths<T>> = 
    _StateAtPath<T,P>

type StatePathApply<T extends Struct, P extends StatePaths<T>> = 
    [...keys: P, state: StateAtPath<T, P>]

//// Exports ////

export {

    State,
    StateApply,

    StatePaths,
    StateAtPath,
    StatePathApply,

    $$state,

}