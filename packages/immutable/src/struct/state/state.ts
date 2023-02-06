import { Empty, Infer } from '@benzed/util'
import { $$copy } from '../../copy'
import { $$equals } from '../../equals'
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

type _StatePathKeys<T> = Exclude<keyof T, typeof $$state | typeof $$copy | typeof $$equals>

type _StatePaths<T> = {
    [K in _StatePathKeys<T>]: T[K] extends object 
        ? [K, T[K] extends Struct ? State<T[K]> : T[K]] | [K, ..._StatePaths<T[K]>] 
        : [K, T[K]]
}[_StatePathKeys<T>]

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

type StateDeepApply<T extends Struct> = T extends StateFul<infer S>
    ? _StatePaths<S>
    : never

//// Exports ////

export {

    State,
    StateFul,
    StateGetter,
    StateSetter,
    StateApply,

    StateDeepApply,
    $$state,

}