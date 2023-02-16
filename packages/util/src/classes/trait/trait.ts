import { addTraits, useTraits } from './add-traits'
import { $$onApply } from './apply-traits'
import { mergeTraits } from './merge-traits'

//// Helper Types ////

export type TraitApply<T extends Trait> = (trait: T) => T | void

/**
 * Extend this class to make traits, use the static methods
 * on this class to apply them.
 */
export abstract class Trait {

    /**
     * Implement this symbol with a static TraitApply method
     * to customize behaviour when a trait is applied.
     */
    static readonly apply: typeof $$onApply = $$onApply

    /**
     * Add traits to an existing class
     */
    static readonly add = addTraits

    /**
     * Create a new class with existing traits
     */
    static readonly use = useTraits

    /**
     * Merge multiple traits into one
     */
    static readonly merge = mergeTraits

    static [Symbol.hasInstance](other: unknown): boolean {
        return this.is(other)
    }

    /**
     * Overwrite this method on extended Traits to allow
     * Traits to be tested for type.
     */
    static is(input: unknown): input is Trait {
        throw new Error(
            `${this.name} has not implemented a static typeguard named 'is'`
        )
    }

    constructor() {
        throw new Error(
            `Trait class ${this.constructor.name}'s constructor ` + 
            'should never be called.'
        )
    }

}

export {
    Trait as Traits
}