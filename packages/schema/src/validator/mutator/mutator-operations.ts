
import { OutputOf } from '@benzed/util'
import { AnyValidate } from '../../validate'

import { MutatorType as M } from './mutator'
import type { AnyMutator, Mutator, MutatorProperties } from './mutator'

import type { Optional, Required, ReadOnly, Writable } from './mutators'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types,
    @typescript-eslint/no-var-requires
*/

//// Helper ////

export function isMutator(target: AnyValidate): target is AnyMutator {
    return 'target' in target && 'mutator' in target
}

export function * eachMutator(validator: AnyValidate): Generator<AnyMutator> {
    while (isMutator(validator)) {
        yield validator
        validator = validator.target
    }
}

export function getMutators(target: AnyValidate): AnyMutator[] {
    return Array.from(eachMutator(target))
}

//// Mutator Operators ////

export type AddMutator<V extends AnyValidate, T extends M> =
    T extends M.Optional
        ? Optional<Required<V>> 
        : T extends M.ReadOnly
            ? ReadOnly<Writable<V>> 
            : T extends M.Async
                ? Async<Sync<V>> 
                : V

export function addMutator<V extends AnyValidate, T extends M>(
    validator: V, 
    type: T
): AddMutator<V,T> {
    return addMutators(validator, type) as AddMutator<V,T>
}
                        
export type AddMutators<V extends AnyValidate, T extends M[]> = T extends [infer T1, ...infer Tr]
    ? T1 extends M 
        ? Tr extends M[]
            ? AddMutators<AddMutator<V, T1>, Tr>
            : AddMutator<V, T1>
        : V
    : V

export function addMutators <V extends AnyValidate, T extends M[]>(
    validator: V,
    ...types: T // TODO update to consider other mutator state
): AddMutators<V,T> {

    let current = validator as AnyValidate

    const { Optional, ReadOnly } = require('./mutators') as typeof import('./mutators')
    for (const type of types) {
        switch (type) {
            case M.Optional: {
                current = new Optional(current)
                break
            }
            case M.ReadOnly: {
                current = new ReadOnly(current)
                break
            }
            case M.Async: {
                throw new Error(`${M[type]} not yet implemented`)
                // return new Async(validate)
                break
            }
            default: {
                const badType: never = type
                throw new Error(`${badType} is an invalid option.`)
            }
        }
    }
    return current as AddMutators<V,T>
}

//// Has Mutator ////

export type HasMutator<V extends AnyValidate, T extends M> = 
    V extends Mutator<infer Vx, infer Tx, any>
        ? T extends Tx  
            ? true
            : HasMutator<Vx, T>
        : false

export function hasMutator<Vx extends AnyValidate, Tx extends M>(
    validate: Vx, 
    type: Tx
): HasMutator<Vx, Tx> {
    for (const mutator of eachMutator(validate)) {
        if (mutator['mutator'] === type)
            return true as HasMutator<Vx, Tx>
    }
    return false as HasMutator<Vx, Tx>
}

//// Ensure Mutator ////
        
export type EnsureMutator<V extends AnyValidate, T extends M> = HasMutator<V,T> extends true
    ? V
    : AddMutator<V, T>

export function ensureMutator<V extends AnyValidate, T extends M>(validate: V, type: T): EnsureMutator<V,T> {
    const applied = hasMutator(validate, type) 
        ? validate : 
        addMutator(validate, type)

    return applied as EnsureMutator<V,T>
}

//// Mutators Of ////

export type MutatorsOf<V extends AnyValidate> = 
    V extends Mutator<infer Vx, infer Tx, any> 
        ? [Tx, ...MutatorsOf<Vx>]
        : []

export function mutatorsOf<V extends AnyValidate>(validate: V): MutatorsOf<V> {
    return getMutators(validate).map(v => v.mutator) as MutatorsOf<V> 
}

//// RemoveMutator ////

export type RemoveMutator<V extends AnyValidate, T extends M> = 
    V extends Mutator<infer Vx, infer Tx, any>
        ? T extends Tx  
            ? Vx
            : AddMutator<RemoveMutator<Vx, T>, Tx>
        : V
export function removeMutator<V extends AnyValidate, T extends M>(
    mutator: V, 
    type: T
): RemoveMutator<V,T> {

    const mutators = getMutators(mutator)

    const types = mutators.map(mutator => mutator.mutator)
    const typeIndex = types.indexOf(type)
    // No type to remove
    if (typeIndex < 0)
        return mutator as RemoveMutator<V,T>

    // Remove type
    types.splice(types.indexOf(type), 1)

    // Rebuild the mutator stack
    const validate = mutators.at(-1)?.target ?? mutator
    return addMutators(validate, ...types) as RemoveMutator<V,T>
}

//// RemoveAllMutators ////

export type RemoveAllMutators<V extends AnyValidate> = V extends Mutator<infer Vx, any, any>
    ? RemoveAllMutators<Vx>
    : V

export function removeAllMutators<V extends AnyValidate>(
    mutator: V
): RemoveAllMutators<V> {
        
    const stack = getMutators(mutator)
    const validate = stack.at(-1)?.target ?? mutator
    return validate as RemoveAllMutators<V>
}

//// Mutators ////

// export type Required<V extends AnyValidate> = RemoveMutator<V, M.Optional>
// export type Optional<V extends AnyValidate> =
//     Mutator<Required<V>, M.Optional, OutputOf<Required<V>> | nil> &
//     MutatorProperties<Required<V>>

// export type Writable<V extends AnyValidate> = RemoveMutator<V, M.ReadOnly>
// export type ReadOnly<V extends AnyValidate> =
//     Mutator<Writable<V>, M.ReadOnly, Readonly<OutputOf<Writable<V>>>> &
//     MutatorProperties<Writable<V>>

export type Sync<V extends AnyValidate> = RemoveMutator<V, M.Async>
export type Async<V extends AnyValidate> =
    Mutator<Sync<V>, M.Async, Promise<OutputOf<Sync<V>>>> &
    MutatorProperties<Sync<V>>