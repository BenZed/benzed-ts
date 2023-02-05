import { Empty, Infer } from '@benzed/util'

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

type _StructState<T extends object> = Infer<{
    [K in Exclude<keyof T, typeof $$state>]: T[K] extends AnyState 
        ? State<T[K]>
        : T[K]
}, object>

type _StructStateApply<T extends object> = Partial<{
    [K in Exclude<keyof T, typeof $$state>]: T[K] extends AnyState 
        ? StateApply<T[K]>
        : T[K]
}>

type _StructDeepPaths<T extends object> = {
    [K in keyof T]: T[K] extends object 
        ? [K] | [K, ..._StructDeepPaths<T[K]>]
        : [K]
}[keyof T]

type _StructStateAtPath<T extends object, P> = P extends [infer P1, ...infer Pr]    
    ? P1 extends keyof T 
        ? T[P1] extends object 
            ? Pr extends []
                ? _StructState<T[P1]>
                : _StructStateAtPath<T[P1], Pr>
            : T[P1]
        : _StructState<T>
    : never

interface _StateFul<T extends object> {
    get [$$state](): T
}

//// Types ////

interface AnyState extends Record<string | symbol, unknown> {}

type State<T extends AnyState> = T extends _StateFul<infer S> 
    ? _StructState<S> 
    : Empty

type StateApply<T extends AnyState> = T extends _StateFul<infer S> 
    ? _StructStateApply<S> 
    : Empty

type StatePaths<T extends AnyState> = _StructDeepPaths<State<T>>

type StatePathApply<T extends AnyState, P extends StatePaths<T>> = 
    [...keys: P, state: _StructStateAtPath<T, P>]

//// Exports ////

export default AnyState

export {

    AnyState,

    State,
    StateApply,

    StatePaths,
    StatePathApply,

    $$state,

}