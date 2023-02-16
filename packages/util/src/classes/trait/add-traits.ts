
import { Property } from '../../property'
import { Intersect } from '../../types'
import { applyTraits, _Traits } from './apply-traits'

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

export function useTraits<T extends _Traits>(...traits: T): AddTraitsConstructor<T> {

    return addTraits(
        class CompositeBase {},
        ...traits
    
    ) as unknown as AddTraitsConstructor<T>

}
