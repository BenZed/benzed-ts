
import { define, each, Intersect, isFunc } from '@benzed/util'
import type { Trait } from './trait'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Symbolic /// 

export const $$onUse = Symbol('on-trait-use')
export const $$onApply = Symbol('on-trait-apply')

//// Helper Types ////

type _InstanceTypes<T extends _BaseTraits | _Traits> = T extends [infer T1, ...infer Tr]
    ? T1 extends _BaseTraits[number]
        ? Tr extends _BaseTraits
            ? [InstanceType<T1>, ..._InstanceTypes<Tr>]
            : [InstanceType<T1>]
        : []
    : []

type _BaseConstructor = new (...args: any[]) => object
type _AbstractBaseConstructor = abstract new (...args: any[]) => object
type _BaseTraits = [
    base: _BaseConstructor | _AbstractBaseConstructor,
    ...traits: _Traits
]

//// Helper Types ////

type _TraitConstructor = new () => Trait
type _AbstractTraitConstructor = abstract new () => Trait

/**
 * @internal
 */
export type _Traits = (_TraitConstructor | _AbstractTraitConstructor)[]

//// Composite Types ////

export type Composite<T extends _BaseTraits | _Traits> = Intersect<_InstanceTypes<T>>

//// AddTraits  ////

export interface AddTraitsConstructor<T extends _BaseTraits | _Traits> {
    new (...args: ConstructorParameters<T[0]>): Composite<T>
}

/**
 * Extend a base class with any number of trait classes.
 * A trait class cannot have any constructor logic.
 */
export function addTraits<T extends _BaseTraits>(...[Base, ...Traits]: T): AddTraitsConstructor<T> {

    class BaseWithTraits extends Base {

        protected [$$onApply](): this {
            let instance = this

            // if we're extending a 
            if (Base.prototype[$$onApply])
                instance = super[$$onApply]() ?? instance

            // apply traits
            for (const Trait of Traits) {
                if ($$onApply in Trait && isFunc(Trait[$$onApply])) 
                    instance = Trait[$$onApply](instance) ?? instance
                
            }

            return instance
        }

        constructor(...args: any[]) {
            super(...args)

            // only apply traits if the base doesn't have an 'onApply' method;
            // otherwise they'll be applied twice.
            if (!Base.prototype[$$onApply])
                return this[$$onApply]() ?? this
        }
    }

    for (const Trait of Traits) {
        
        // apply any prototypal trait implementations
        for (const [key, descriptor] of each.defined.descriptorOf(Trait.prototype)) 
            define(BaseWithTraits.prototype, key, descriptor)

        // apply any trait constructor mutations
        if ($$onUse in Trait && isFunc(Trait[$$onUse]))
            Trait[$$onUse](BaseWithTraits)
    }

    // Composite name
    const name = [...Traits, Base].map(c => c.name).join('')
    define.named(name, BaseWithTraits) 

    return BaseWithTraits as AddTraitsConstructor<T>
}

//// Use Traits ////

export function useTraits<T extends _Traits>(...Traits: T): AddTraitsConstructor<T> {

    return addTraits(
        class Base {}, 
        ...Traits
    ) as unknown as AddTraitsConstructor<T>

}
