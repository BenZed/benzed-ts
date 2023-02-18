import { EachIterable } from './each-iterable'

import { eachObjectInPrototypeChain, eachValue } from './generators'
import { EachEnumerableInheritedKey } from './each-key-interface'
import { eachIndex, Indexable, IndexesOf, IndexesOfOptionsSignature } from './index-generator'
import { isArrayLike, isIterable } from '../types/guards'

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
     * Iterate through each value on an object.
     */
    <T extends object>(object: T): EachIterable<T[keyof T]>
    
    /**
     * Iterate through each value on an arraylike.
     */
    <T>(arrayLike: ArrayLike<T>): EachIterable<T>

    /**
     * Iterate each element of any number of iterables
     */
    <T extends Iterables>(...items: T): EachIterable<IterableYeild<T>>

    /**
     * Iterate through each prototype chain of any number of objects
     */
    prototypeOf<T extends object[]>(...objects: T): EachIterable<object>

    indexOf<T extends Indexable>(arrayLike: T, ...options: IndexesOfOptionsSignature): EachIterable<IndexesOf<T>> 

}

//// Patch the each method to match the EachEnumerableInheritedKey instance ////

function each(...items: Iterables | [ArrayLike<unknown>] | [object]) {

    if (!isIterable(items[0])) {
        items[0] = isArrayLike(items[0]) 
            ? Array.from(items[0])
            : eachValue(items[0])
    }

    return new EachIterable(items as Iterables)
}

each.own = EachEnumerableInheritedKey.prototype.own
each.defined = EachEnumerableInheritedKey.prototype.defined
each.keyOf = EachEnumerableInheritedKey.prototype.keyOf
each.nameOf = EachEnumerableInheritedKey.prototype.nameOf
each.symbolOf = EachEnumerableInheritedKey.prototype.symbolOf
each.descriptorOf = EachEnumerableInheritedKey.prototype.descriptorOf
each.valueOf = EachEnumerableInheritedKey.prototype.valueOf
each.entryOf = EachEnumerableInheritedKey.prototype.entryOf

each.prototypeOf = function prototypeOf<T extends object[]>(...objects: T): EachIterable<object> {
    return new EachIterable(objects.map(eachObjectInPrototypeChain))
}

each.indexOf = function indexOf<T extends Indexable>(
    arrayLike: T, 
    ...options: IndexesOfOptionsSignature
): EachIterable<IndexesOf<T>> {
    const indexGenerator = (eachIndex as any)(arrayLike, ...options)
    return new EachIterable([indexGenerator])
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
