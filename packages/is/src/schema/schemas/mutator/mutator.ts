
import { KeysOf, nil, OutputOf } from '@benzed/util'

import { Validate, AnyValidate } from '../../../validator'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Mutator Definitions Types ////

enum M {
    Optional,
    ReadOnly,
    Async
}

enum O {
    Array,
    Set,
    Map,
    Record
}

export { M as MutatorType }

export interface Mutator<V extends AnyValidate, T extends M, O = OutputOf<V>> extends Validate<unknown, O> {
    validate: V
    mutator: T
}

export type MutatorProperties<V extends AnyValidate> = {
    [K in Exclude<keyof V, KeysOf<Mutator<V, M>>>]: V[K]
}

//// Mutator Operators ////

export type AddMutator<V extends AnyValidate, T extends M> =
    T extends M.Optional
        ? Optional<V> 
        : T extends M.ReadOnly
            ? ReadOnly<V> 
            : T extends M.Async
                ? Async<V> 
                : V

export type RemoveMutator<V extends AnyValidate, T extends M> = 
    V extends Mutator<infer Vx, infer Tx, any>
        ? T extends Tx  
            ? Vx
            : AddMutator<RemoveMutator<Vx, T>, Tx>
        : V

export type HasMutator<V extends AnyValidate, T extends M> = 
    V extends Mutator<infer Vx, infer Tx, any>
        ? T extends Tx  
            ? true
            : HasMutator<Vx, T>
        : false

export type ApplyMutator<V extends AnyValidate, T extends M> = HasMutator<V,T> extends true
    ? V
    : AddMutator<V, T>

export type MutatorsOf<V extends AnyValidate> = 
    V extends Mutator<infer Vx, infer Tx, any> 
        ? [Tx, ...MutatorsOf<Vx>]
        : []

export type AddMutators<V extends AnyValidate, T extends M[]> = T extends [infer T1, ...infer Tr]
    ? T1 extends M 
        ? Tr extends M[]
            ? AddMutators<AddMutator<V, T1>, Tr>
            : AddMutator<V, T1>
        : V
    : V

export type RemoveAllMutators<V extends AnyValidate> = V extends Mutator<infer Vx, any, any>
    ? RemoveAllMutators<Vx>
    : V

//// Mutators ////

export type Required<V extends AnyValidate> = RemoveMutator<V, M.Optional>
export type Optional<V extends AnyValidate> =
    Mutator<Required<V>, M.Optional, OutputOf<Required<V>> | nil> &
    MutatorProperties<Required<V>>

export type Writable<V extends AnyValidate> = RemoveMutator<V, M.ReadOnly>
export type ReadOnly<V extends AnyValidate> =
    Mutator<Writable<V>, M.ReadOnly, Readonly<OutputOf<Writable<V>>>> &
    MutatorProperties<Writable<V>>

export type Sync<V extends AnyValidate> = RemoveMutator<V, M.Async>
export type Async<V extends AnyValidate> =
    Mutator<Sync<V>, M.Async, Promise<OutputOf<Sync<V>>>> &
    MutatorProperties<Sync<V>>