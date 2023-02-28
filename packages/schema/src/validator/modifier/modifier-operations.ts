
import type {
    Modifier,
} from './modifier'

import {
    Optional,
    Required,
    ReadOnly,
    Writable,
    ToggleNot,
    Not
} from './modifiers'

import { Validator } from '../validator'

import { AnyTypeGuard, each, Each, isKeyed } from '@benzed/util'

import { Mutate } from '@benzed/traits'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types,
    @typescript-eslint/no-var-requires
*/

//// Symbols ////

export const $$type = Symbol('modifier-type')

//// Types ////

export enum ModifierType {
    Optional,
    ReadOnly,
    Not,
    // Async
    // ArrayOf
}

//// Helper ////

export const isModifier: (input: unknown) => input is Modifier = 
    isKeyed(Mutate.target, $$type) as AnyTypeGuard

export function eachModifier(validator: Validator): Each<Modifier> {
    return each(function *() {
        while (isModifier(validator)) {
            yield validator
            validator = validator[Mutate.target]
        }
    })
}

export function getModifiers(target: Validator): Modifier[] {
    return Array.from(eachModifier(target))
}

export function assertUnmodified(target: Validator, type: ModifierType): void {
    if (hasModifier(target, type))
        throw new Error(`Target already has modifier ${ModifierType[type]}`)
}

//// Modifier Operators ////

export type AddModifier<V extends Validator, T extends ModifierType> =
    T extends ModifierType.Optional
        ? Optional<Required<V>> 
        : T extends ModifierType.ReadOnly
            ? ReadOnly<Writable<V>> 
            : T extends ModifierType.Not
                ? ToggleNot<V> 
                : V

export function addModifier<V extends Validator, T extends ModifierType>(
    validator: V, 
    type: T
): AddModifier<V,T> {
    return addModifiers(validator, type) as AddModifier<V,T>
}
                        
export type AddModifiers<V extends Validator, T extends ModifierType[]> = T extends [infer T1, ...infer Tr]
    ? T1 extends ModifierType
        ? Tr extends ModifierType[]
            ? AddModifiers<AddModifier<V, T1>, Tr>
            : AddModifier<V, T1>
        : V
    : V

export function addModifiers <V extends Validator, T extends ModifierType[]>(
    validator: V,
    ...types: T // TODO update to consider other modifier state
): AddModifiers<V,T> {

    let current = validator as Validator

    const { Optional, ReadOnly, Not } = require('./modifiers') as typeof import('./modifiers')
    for (const type of types) {
        switch (type) {

            case ModifierType.Optional: {
                current = hasModifier(current, ModifierType.Optional)
                    ? current
                    : new Optional(current)
                break
            }

            case ModifierType.ReadOnly: {
                current = hasModifier(current, ModifierType.ReadOnly)
                    ? current
                    : new ReadOnly(current)
                break
            }

            case ModifierType.Not: {
                current = hasModifier(current, ModifierType.Not)
                    ? (current as Not<V>)[Mutate.target] 
                    : new Not(current)
                break
            }

            default: {
                const badType: never = type
                throw new Error(`${badType} is an invalid option.`)
            }
        }
    }
    return current as AddModifiers<V,T>
}

//// Has Modifier ////

export type HasModifier<V extends Validator, T extends ModifierType> = 
    V extends Modifier<infer Vx, infer Tx, any>
        ? T extends Tx  
            ? true
            : HasModifier<Vx, T>
        : false

export function hasModifier<Vx extends Validator, Tx extends ModifierType>(
    validate: Vx, 
    type: Tx
): HasModifier<Vx, Tx> {
    for (const modifier of eachModifier(validate)) {
        if (modifier[$$type] === type)
            return true as HasModifier<Vx, Tx>
    }
    return false as HasModifier<Vx, Tx>
}

//// Ensure Modifier ////
        
export type EnsureModifier<V extends Validator, T extends ModifierType> = HasModifier<V,T> extends true
    ? V
    : AddModifier<V, T>

export function ensureModifier<V extends Validator, T extends ModifierType>(validate: V, type: T): EnsureModifier<V,T> {
    const applied = hasModifier(validate, type) 
        ? validate  
        : addModifier(validate, type)

    return applied as EnsureModifier<V,T>
}

//// Modifiers Of ////

export type ModifiersOf<V extends Validator> = 
    V extends Modifier<infer Vx, infer Tx, any> 
        ? [Tx, ...ModifiersOf<Vx>]
        : []

export function modifiersOf<V extends Validator>(validate: V): ModifiersOf<V> {
    return getModifiers(validate).map(v => v[$$type]) as ModifiersOf<V> 
}

//// RemoveModifier ////

export type RemoveModifier<V extends Validator, T extends ModifierType> = 
    V extends Modifier<infer Vx, infer Tx, any>
        ? T extends Tx  
            ? Vx
            : AddModifier<RemoveModifier<Vx, T>, Tx>
        : V
export function removeModifier<V extends Validator, T extends ModifierType>(
    modifier: V, 
    type: T
): RemoveModifier<V,T> {

    const modifiers = getModifiers(modifier)

    const types = modifiers.map(modifier => modifier[$$type])
    const typeIndex = types.indexOf(type)
    // No type to remove
    if (typeIndex < 0)
        return modifier as RemoveModifier<V,T>

    // Remove type
    types.splice(types.indexOf(type), 1)

    // Rebuild the modifier stack
    const validate = modifiers.at(-1)?.[Mutate.target] ?? modifier
    return addModifiers(validate, ...types) as RemoveModifier<V,T>
}

//// RemoveAllModifiers ////

export type RemoveAllModifiers<V extends Validator> = V extends Modifier<infer Vx, any, any>
    ? RemoveAllModifiers<Vx>
    : V

export function removeAllModifiers<V extends Validator>(
    modifier: V
): RemoveAllModifiers<V> {
        
    const stack = getModifiers(modifier)
    const validate = stack.at(-1)?.[Mutate.target] ?? modifier
    return validate as RemoveAllModifiers<V>
}
