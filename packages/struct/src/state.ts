import { 
    Empty,
    Infer,
} from '@benzed/util'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Symbols ////

const $$state = Symbol('state')

//// Helper Types ////

type _StructState<T extends object> = Infer<{
    [K in Exclude<keyof T, typeof $$state>]: T[K] extends State 
        ? StructState<T[K]>
        : T[K]
}, object>

type _StructStateApply<T extends object> = Partial<{
    [K in Exclude<keyof T, typeof $$state>]: T[K] extends State 
        ? StructStateApply<T[K]>
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

type State = Record<string | symbol, unknown>

type StructState<T extends State> = T extends _StateFul<infer S> 
    ? _StructState<S> 
    : Empty

type StructStateApply<T extends State> = T extends _StateFul<infer S> 
    ? _StructStateApply<S> 
    : Empty

type StructStatePaths<T extends State> = _StructDeepPaths<StructState<T>>

type StructStatePathApply<T extends State, P extends StructStatePaths<T>> = 
    [...keys: P, state: _StructStateAtPath<T, P>]

// interface StatefulStruct<T extends object> extends _StateFul<T> {}

//// Exports ////

export default State

export {

    State,

    StructState,
    StructStateApply,

    StructStatePaths,
    StructStatePathApply,

    $$state,

}