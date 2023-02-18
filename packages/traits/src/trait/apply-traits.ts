
import { isFunc } from '@benzed/util'
import type { Trait } from './trait'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Symbols ////

/**
 * Implement this symbol statically on a trait class
 * 
 */
export const $$onApply = Symbol('on-trait-apply')

//// Helper Types ////

type _TraitConstructor = new () => Trait 
type _AbstractTraitConstructor = abstract new () => Trait

/**
 * @internal
 */
export type _Traits = (_TraitConstructor | _AbstractTraitConstructor)[]

//// Apply Traits ////

/**
 * Run any static Trait.apply methods that may exist
 */
export function applyTraits<T extends _Traits>(instance: object, traits: T): object {

    for (const trait of traits as any[]) {

        if (
            $$onApply in trait && 
            isFunc(trait[$$onApply])
        )
            instance = trait[$$onApply](instance) ?? instance
    }

    return instance
}
