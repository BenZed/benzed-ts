import { addTraits, AddTraitsConstructor, Composite, useTraits } from './add-traits'
import { AnyTypeGuard, Intersect, isFunc, isIntersection, isSymbol } from '../../types'

import { $$onApply, applyTraits, _Traits } from './apply-traits'
import { Trait } from './trait'
import { each } from '../../each'

//// Helper Methods ////

type _AllSymbolsOf<T extends _Traits> = T extends [infer T1, ...infer Tr]
    ? Tr extends _Traits 
        ? [_SymbolsOf<T1>, ..._AllSymbolsOf<Tr>]
        : [_SymbolsOf<T1>]
    : []

type _SymbolsOf<T> = {  
    readonly [K in keyof T as T[K] extends symbol ? K : never ]: T[K]
}

//// Helper ////

//// Merge Traits ////

export type MergeTraitsConstructor<T extends _Traits> = AddTraitsConstructor<T> & {

    readonly apply: typeof Trait.apply

    readonly add: typeof addTraits
    readonly use: typeof useTraits
    readonly merge: typeof mergeTraits

    is(input: unknown): input is Composite<T>

} & Intersect<_AllSymbolsOf<T>>

/**
 * Combine multiple traits into one.
 */
export function mergeTraits<T extends _Traits>(...traits: T): MergeTraitsConstructor<T> {

    const MergedTraits = addTraits(class extends Trait {

        // Apply all traits
        static [$$onApply](instance: Composite<T>): unknown {
            return applyTraits(instance as object, traits)
        }
        
        // Intersect all is methods
        static override is = isIntersection(
            ...traits.map(trait => {

                if (!('is' in trait) || !isFunc(trait.is))
                    throw new Error(`${trait.name} does not have a static \'is\' typeguard.`)

                return trait.is as AnyTypeGuard
            })
        ) as AnyTypeGuard

    },
    
    ...traits) as unknown as MergeTraitsConstructor<T>

    // Add Static Sybols
    for (const trait of traits) {
        for (const key of each.keyOf(trait)) {
            if (isSymbol(trait[key]))
                MergedTraits[key] = trait[key]
        }
    }

    return MergedTraits
}