
import { define, each, Intersect } from '@benzed/util'
import { applyTraits, _Traits } from './apply-traits'
import { Traits } from './trait'

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

    class CompositeConstructor extends base {}

    for (const trait of traits) {
        for (const [key, descriptor] of each.defined.descriptorOf(trait.prototype)) 
            define(CompositeConstructor.prototype, key, descriptor)
    }

    const name = [...traits, base].map(c => c.name).join('')

    define.named(name, CompositeConstructor) 

    define.hidden(
        CompositeConstructor, 
        Traits.onApply, 
        (i: object) => applyTraits(i, traits)
    )

    return new Proxy(CompositeConstructor, {
        construct(constructor, ...args) {
            const instance = Reflect.construct(constructor, ...args)
            return (constructor as any)[Traits.onApply](instance)
        }
    }) as unknown as AddTraitsConstructor<T> 

}

//// Use Traits ////

export function useTraits<T extends _Traits>(...traits: T): AddTraitsConstructor<T> {

    return addTraits(
        class CompositeBase {},
        ...traits
    
    ) as unknown as AddTraitsConstructor<T>

}
