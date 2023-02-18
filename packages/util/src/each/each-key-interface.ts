import { Entries } from '../types'
import { EachIterable } from './each-iterable'

import { eachDescriptor, eachEntry, eachKey, eachValue, KeyType } from './generators'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper ////

type Keys<T extends object[]> = keyof T[number]

type Names<T extends object[]> = Extract<Keys<T>, string>

type Symbols<T extends object[]> = Extract<Keys<T>, symbol>

type Values<T extends object[]> = T[number][keyof T[number]]

//// Interface ////

abstract class EachKey {

    protected abstract get _options(): Readonly<{ enumerable: boolean, own: boolean }>

    keyOf<T extends object[]>(...objects: T): EachIterable<Keys<T>> {
        return new EachIterable(
            objects.map(object => 
                eachKey(object, { type: KeyType.Key, ...this._options })
            )
        )
    }

    nameOf<T extends object[]>(...objects: T): EachIterable<Names<T>> {
        return new EachIterable(
            objects.map(object => 
                eachKey(object, { type: KeyType.Name, ...this._options })
            )
        )
    }

    symbolOf<T extends object[]>(...objects: T): EachIterable<Symbols<T>> {
        return new EachIterable(
            objects.map(object => 
                eachKey(object, { type: KeyType.Symbol, ...this._options })
            )
        )
    }

    valueOf<T extends object[]>(...objects: T): EachIterable<Values<T>> {
        return new EachIterable(
            objects.map(object => 
                eachValue(object, { type: KeyType.Key, ...this._options })
            )
        )
    }

    entryOf<T extends object[]>(...objects: T): EachIterable<Entries<T[number]>> {
        return new EachIterable(
            objects.map(object => 
                eachEntry(object, { type: KeyType.Key, ...this._options })
            )
        )
    }

    descriptorOf<T extends object[]>(...objects: T): EachIterable<[Keys<T>, PropertyDescriptor]> {
        return new EachIterable(
            objects.map(object => 
                eachDescriptor(object, { type: KeyType.Key, ...this._options })
            )
        )
    }
}

export class EachEnumerableInheritedKey extends EachKey {

    protected get _options() {
        return { enumerable: true, own: false }
    }

    get own(): EachEnumerableOwnKey {
        return new EachEnumerableOwnKey
    }

    get defined(): EachDefinedInheritedKey {
        return new EachDefinedInheritedKey
    }

}

class EachDefinedInheritedKey extends EachKey {

    protected get _options() {
        return { enumerable: false, own: false }
    }

    get own(): EachDefinedOwnKey {
        return new EachDefinedOwnKey
    }

}

class EachEnumerableOwnKey extends EachKey {

    protected get _options() {
        return { enumerable: true, own: true }
    }

    get defined(): EachDefinedOwnKey {
        return new EachDefinedOwnKey
    }

}

class EachDefinedOwnKey extends EachKey {

    protected get _options() {
        return { enumerable: false, own: true }
    }

}
