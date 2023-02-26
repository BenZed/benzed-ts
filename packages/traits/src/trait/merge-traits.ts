import { AnyTypeGuard, each, Intersect, isFunc, isIntersection, isSymbol } from '@benzed/util'
import { $$onUse, addTraits, AddTraitsConstructor, Composite, useTraits } from './add-traits'
import { $$onApply, _Traits } from './apply-traits'
import { Trait } from './trait'

//// Helper Methods ////

type _AllNewSymbolsOf<T extends _Traits> = T extends [infer T1, ...infer Tr]
    ? Tr extends _Traits 
        ? [_NewSymbolsOf<T1>, ..._AllNewSymbolsOf<Tr>]
        : [_NewSymbolsOf<T1>]
    : []

type _NewSymbolsOf<T> = {  
    readonly [K in keyof T as T[K] extends symbol 
        ? T[K] extends typeof Trait.onApply 
            ? never 
            : K 
        : never 
    ]: T[K]
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

    // Add Static Symbols
    for (const trait of traits) {
        for (const key of each.keyOf(trait)) {
            const value = trait[key]
            if (!isSymbol(value) || value === $$onApply || value === $$onUse)
                continue

            MergedTraits[key] = value
        }
    }

    return MergedTraits
}