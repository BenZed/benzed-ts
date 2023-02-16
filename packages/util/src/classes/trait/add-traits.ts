
import { Property } from '../../property'
import { AnyTypeGuard, Intersect, isFunc, isIntersection } from '../../types'
import { $$onApply, applyTraits, _Traits } from './apply-traits'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

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
export function addTraits<T extends _BaseTraits>(...[base, ...traits]: T): AddTraitsConstructor<T> {

    class CompositeConstructor extends base {
        constructor(...args: any[]) {
            super(...args)
            return applyTraits(this, traits)
        }
    }

    for (const constructor of [...traits]) {
        Property.namesOf(constructor.prototype).forEach((name) => {
            Property.define(
                CompositeConstructor.prototype,
                name,
                Property.descriptorOf(constructor.prototype, name) ?? {}
            )
        })
    }

    const name = [base, ...traits].map(c => c.name).join('')

    return Property.name(CompositeConstructor, name) as unknown as AddTraitsConstructor<T>

}

//// Use Traits ////

export interface UseTraitsConstructor<T extends _Traits> extends AddTraitsConstructor<T> {

    is(input: unknown): input is Composite<T>

}

/**
 * Combine multiple traits into one.
 */
export function useTraits<T extends _Traits>(...traits: T): UseTraitsConstructor<T> {

    return addTraits(class {

        static [$$onApply](instance: Composite<T>): unknown {
            return applyTraits(instance as object, traits)
        }
        
        static is: (input: unknown) => input is Composite<T> = isIntersection(
            ...traits.map(trait => {

                if (!('is' in trait) || !isFunc(trait.is))
                    throw new Error(`${trait.name} does not have a static \'is\' typeguard.`)

                return trait.is as AnyTypeGuard
            })
        ) as AnyTypeGuard

    }, ...traits) as unknown as UseTraitsConstructor<T>
}
