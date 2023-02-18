import { addTraits, AddTraitsConstructor, Composite, useTraits } from './add-traits'
import { AnyTypeGuard, Intersect, isFunc, isIntersection, isSymbol } from '../../types'

import { $$onApply, applyTraits, _Traits } from './apply-traits'
import { each } from '../../each'
import { Trait } from './trait'

//// Helper Methods ////

type _AllNewSymbolsOf<T extends _Traits> = T extends [infer T1, ...infer Tr]
    ? Tr extends _Traits 
        ? [_NewSymbolsOf<T1>, ..._AllNewSymbolsOf<Tr>]
        : [_NewSymbolsOf<T1>]
    : []

type _NewSymbolsOf<T> = {  
    readonly [K in keyof T as T[K] extends symbol ? T[K] extends typeof Trait.apply ? never : K : never ]: T[K]
}

//// Merge Traits ////

export type MergedTraitsConstructor<T extends _Traits> = AddTraitsConstructor<T> & {

    readonly add: typeof addTraits
    readonly use: typeof useTraits
    readonly merge: typeof mergeTraits

    is(input: unknown): input is Composite<T>

} & Intersect<_AllNewSymbolsOf<T>>

/**
 * Combine multiple traits into one.
 */
export function mergeTraits<T extends _Traits>(...traits: T): MergedTraitsConstructor<T> {

    const MergedTraits = addTraits(class extends Trait {

        // Apply all traits
        static [$$onApply](instance: Composite<T>): unknown {
            return applyTraits(instance as object, traits)
        }

        readonly add = addTraits
        readonly use = useTraits
        readonly merge = mergeTraits
        
        // Intersect all is methods
        static override readonly is = isIntersection(
            ...traits.map(trait => {

                if (!('is' in trait) || !isFunc(trait.is))
                    throw new Error(`${trait.name} does not have a static \'is\' typeguard.`)

                return trait.is as AnyTypeGuard
            })
        ) as AnyTypeGuard

    },
    
    ...traits) as MergedTraitsConstructor<T>

    // Add Static Sybols
    for (const trait of traits) {
        for (const key of each.keyOf(trait)) {
            if (isSymbol(trait[key]))
                MergedTraits[key] = trait[key]
        }
    }

    return MergedTraits
}