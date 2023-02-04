
import {
    $$target,
    $$type,
    MutatorType as M,
    AnyMutator,
    Mutator,
    MutatorType
} from './mutator'

import {
    Optional,
    Required,
    ReadOnly,
    Writable,
    ToggleNot,
    Not
} from './mutators'

import { AnyValidatorStruct } from '../validator-struct'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types,
    @typescript-eslint/no-var-requires
*/

//// Helper ////

export function isMutator(target: AnyValidatorStruct): target is AnyMutator {
    return $$target in target && $$type in target
}

export function * eachMutator(validator: AnyValidatorStruct): Generator<AnyMutator> {
    while (isMutator(validator)) {
        yield validator
        validator = validator[$$target]
    }
}

export function getMutators(target: AnyValidatorStruct): AnyMutator[] {
    return Array.from(eachMutator(target))
}

export function assertUnMutated(target: AnyValidatorStruct, type: M): void {
    if (hasMutator(target, type))
        throw new Error(`Target already has mutator ${MutatorType[type]}`)
}

//// Mutator Operators ////

export type AddMutator<V extends AnyValidatorStruct, T extends M> =
    T extends M.Optional
        ? Optional<Required<V>> 
        : T extends M.ReadOnly
            ? ReadOnly<Writable<V>> 
            : T extends M.Not
                ? ToggleNot<V> 
                : V

export function addMutator<V extends AnyValidatorStruct, T extends M>(
    validator: V, 
    type: T
): AddMutator<V,T> {
    return addMutators(validator, type) as AddMutator<V,T>
}
                        
export type AddMutators<V extends AnyValidatorStruct, T extends M[]> = T extends [infer T1, ...infer Tr]
    ? T1 extends M 
        ? Tr extends M[]
            ? AddMutators<AddMutator<V, T1>, Tr>
            : AddMutator<V, T1>
        : V
    : V

export function addMutators <V extends AnyValidatorStruct, T extends M[]>(
    validator: V,
    ...types: T // TODO update to consider other mutator state
): AddMutators<V,T> {

    let current = validator as AnyValidatorStruct

    const { Optional, ReadOnly, Not } = require('./mutators') as typeof import('./mutators')
    for (const type of types) {
        switch (type) {

            case M.Optional: {
                current = hasMutator(current, MutatorType.Optional)
                    ? current
                    : new Optional(current)
                break
            }

            case M.ReadOnly: {
                current = hasMutator(current, MutatorType.ReadOnly)
                    ? current
                    : new ReadOnly(current)
                break
            }

            case M.Not: {
                current = hasMutator(current, MutatorType.Not)
                    ? (current as Not<V>)[$$target] 
                    : new Not(current)
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

export type HasMutator<V extends AnyValidatorStruct, T extends M> = 
    V extends Mutator<infer Vx, infer Tx, any>
        ? T extends Tx  
            ? true
            : HasMutator<Vx, T>
        : false

export function hasMutator<Vx extends AnyValidatorStruct, Tx extends M>(
    validate: Vx, 
    type: Tx
): HasMutator<Vx, Tx> {
    for (const mutator of eachMutator(validate)) {
        if (mutator[$$type] === type)
            return true as HasMutator<Vx, Tx>
    }
    return false as HasMutator<Vx, Tx>
}

//// Ensure Mutator ////
        
export type EnsureMutator<V extends AnyValidatorStruct, T extends M> = HasMutator<V,T> extends true
    ? V
    : AddMutator<V, T>

export function ensureMutator<V extends AnyValidatorStruct, T extends M>(validate: V, type: T): EnsureMutator<V,T> {
    const applied = hasMutator(validate, type) 
        ? validate  
        : addMutator(validate, type)

    return applied as EnsureMutator<V,T>
}

//// Mutators Of ////

export type MutatorsOf<V extends AnyValidatorStruct> = 
    V extends Mutator<infer Vx, infer Tx, any> 
        ? [Tx, ...MutatorsOf<Vx>]
        : []

export function mutatorsOf<V extends AnyValidatorStruct>(validate: V): MutatorsOf<V> {
    return getMutators(validate).map(v => v[$$type]) as MutatorsOf<V> 
}

//// RemoveMutator ////

export type RemoveMutator<V extends AnyValidatorStruct, T extends M> = 
    V extends Mutator<infer Vx, infer Tx, any>
        ? T extends Tx  
            ? Vx
            : AddMutator<RemoveMutator<Vx, T>, Tx>
        : V
export function removeMutator<V extends AnyValidatorStruct, T extends M>(
    mutator: V, 
    type: T
): RemoveMutator<V,T> {

    const mutators = getMutators(mutator)

    const types = mutators.map(mutator => mutator[$$type])
    const typeIndex = types.indexOf(type)
    // No type to remove
    if (typeIndex < 0)
        return mutator as RemoveMutator<V,T>

    // Remove type
    types.splice(types.indexOf(type), 1)

    // Rebuild the mutator stack
    const validate = mutators.at(-1)?.[$$target] ?? mutator
    return addMutators(validate, ...types) as RemoveMutator<V,T>
}

//// RemoveAllMutators ////

export type RemoveAllMutators<V extends AnyValidatorStruct> = V extends Mutator<infer Vx, any, any>
    ? RemoveAllMutators<Vx>
    : V

export function removeAllMutators<V extends AnyValidatorStruct>(
    mutator: V
): RemoveAllMutators<V> {
        
    const stack = getMutators(mutator)
    const validate = stack.at(-1)?.[$$target] ?? mutator
    return validate as RemoveAllMutators<V>
}
