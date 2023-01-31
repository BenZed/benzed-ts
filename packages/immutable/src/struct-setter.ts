import { Indexes, IndexesOf, Intersect, KeysOf } from '@benzed/util/src'
import Struct, { StructState } from './struct'

//// Symbols ////

export const $$nonStateKey = Symbol('do-not-create-setter-for-these-keys')

//// Helper Types ////

/**
 * An object that dynamically creates setter methods for state 
 * properties on structs
 */
type _StructSetters<S extends Structs, I extends number[] = Indexes<S>> = I extends [infer I1, ...infer Ir]
    ? I1 extends IndexesOf<S> 
        ? Ir extends number[]   
            ? [_StructSetter<S, S[I1]>, ..._StructSetters<S, Ir>]
            : [_StructSetter<S, S[I1]>]
        : []
    :[]

type _StructSetter<S extends Structs, Si extends Struct> = {
    [K in StateKeys<Si>]: K extends KeysOf<Si> 
        ? (input: Si[K]) => StructSetters<S>
        : never
}

//// Types ////

export type StateKeys<S extends Struct> = S extends { [$$nonStateKey]: infer K }
    ? K extends readonly string[]
        ? Exclude<KeysOf<StructState<S>>, K[number]>
        : KeysOf<StructState<S>>
    : KeysOf<StructState<S>>

export type Structs = Struct[]

export type StructSetters<S extends Structs> = Intersect<_StructSetters<S>>

//// Implementation ////

