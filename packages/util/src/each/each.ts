import { EachIterable } from './each-iterable'

import { eachObjectInPrototypeChain } from './generators'
import { EachEnumerableInheritedKey } from './each-key-interface'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper Types ////

type Iterables = Iterable<any>[]

type IterableYeild<T extends Iterables> = T[number] extends Iterable<infer Tx> 
    ? Tx 
    : never

//// Hero Type ////

interface Each extends Omit<EachEnumerableInheritedKey, '_options'> {
    /**
     * Iterate each element of any number of iterables
     */
    <T extends Iterables>(...items: T): EachIterable<IterableYeild<T>>

    /**
     * Iterate through each prototype chain of any number of objects
     */
    prototypeOf<T extends object[]>(...objects: T): EachIterable<object>

}

//// Patch the each method to match the EachEnumerableInheritedKey instance ////

function each(...items: Iterables) {
    return new EachIterable(items)
}

each.keyOf = EachEnumerableInheritedKey.prototype.keyOf
each.nameOf = EachEnumerableInheritedKey.prototype.nameOf
each.symbolOf = EachEnumerableInheritedKey.prototype.symbolOf
each.descriptorOf = EachEnumerableInheritedKey.prototype.descriptorOf
each.valueOf = EachEnumerableInheritedKey.prototype.valueOf
each.entryOf = EachEnumerableInheritedKey.prototype.entryOf
each.own = EachEnumerableInheritedKey.prototype.own
each.defined = EachEnumerableInheritedKey.prototype.defined
each.prototypeOf = function prototypeOf<T extends object[]>(...objects: T): EachIterable<object> {
    return new EachIterable(objects.map(eachObjectInPrototypeChain))
}

Object.defineProperties(
    each,
    {
        _options: { 
            value: { 
                enumerable: true, 
                own: false 
            }, 
            enumerable: false, 
            writable: false, 
            configurable: false 
        },
        own: Object.getOwnPropertyDescriptor(EachEnumerableInheritedKey.prototype, 'own') as PropertyDescriptor,
        defined: Object.getOwnPropertyDescriptor(EachEnumerableInheritedKey.prototype, 'defined') as PropertyDescriptor,
    }
)

//// Exports ////

export default each as Each
