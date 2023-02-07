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

type SubStateApply<T extends Struct> = any

//// Exports ////

export {

    State,
    StateFul,
    StateGetter,
    StateSetter,
    StateApply,

    SubStateApply,
    $$state,

}