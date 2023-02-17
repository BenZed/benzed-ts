import { addTraits, useTraits } from './add-traits'
import { $$onApply } from './apply-traits'
import { mergeTraits } from './merge-traits'

//// Helper Types ////

export type TraitApply<T extends Trait> = (trait: T) => T | void

/**
 * 
 * A Trait is essentially a runtime interface. 
 * 
 * Using class syntax to declare abstract properties or partial implementations,
 * a trait will be added to a regular class via mixins. 
 * 
 * Extend this class to make traits, use the static methods
 * on this class to apply them.
 */
export abstract class Trait {

    /**
     * Extend an existing class with an arbitrary number of traits
     */
    static readonly add = addTraits

    /**
     * Extend a an arbitrary number of traits into a new class.
     */
    static readonly use = useTraits

    /**
     * Merge multiple traits into one.
     */
    static readonly merge = mergeTraits

    /**
     * Extended classes may implement this static 
     * method to customize behaviour that occurs when
     * a trait is applied.
     */
    static readonly apply: typeof $$onApply = $$onApply
    
    /**
     * Overwrite this method on extended Traits to allow
     * Traits to be tested for type.
     */
    static is(input: unknown): input is Trait {
        throw new Error(
            `${this.name} has not implemented a static typeguard named 'is'`
        )
    }

    /**
     * Traits are structrual in nature and don't exist as 
     * instances in practice, so the instanceof operator's 
     * behaviour is modified to mirror the typeguard.
     * 
     * Any object that fulfills the structural contract outlined
     * by the type guard is considered an instanceof that trait.
     */
    static [Symbol.hasInstance](other: unknown): boolean {
        return this.is(other)
    }

    /**
     * A trait should never be constructed. It exists only to
     * define contracts and optionally implement 
     */
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