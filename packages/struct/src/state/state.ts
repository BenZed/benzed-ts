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
        ? [K, T[K] extends Struct ? State<T[K]> : T[K]] | [K, ..._StatePaths<T[K]>] 
        : [K, T[K]]
}[_StatePathKeys<T>]

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

type StatePathApply<T extends Struct> = T extends _StateFul<infer S>
    ? _StatePaths<S>
    : never

//// Exports ////

export {

    State,
    StateApply,

    StatePathApply,
    $$state,

}