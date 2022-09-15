import equals from './equals'
import copy from './copy'
import indexOf from './array/index-of'

import { CopyComparable } from './index'

import { $$copy, $$equals } from './symbols'

/* eslint-disable 
    @typescript-eslint/no-this-alias,
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/prefer-readonly-parameter-types
*/

/*** Main ***/

class ValueMap<K, V> implements CopyComparable<ValueMap<K, V>> {

    // State 

    private _keys: K[] = []

    private _values: V[] = []

    // Constructor 

    public constructor (keyValues: [K, V][] = []) {

        if (keyValues) {
            for (const keyValue of keyValues) {
                const [key, value] = keyValue
                this.set(key, value)
            }
        }
    }

    // Interface

    public get(key: K): V | undefined {
        const index = indexOf(this._keys, key)
        return this._values[index]
    }

    public set(key: K, value: V): this {

        let index = indexOf(this._keys, key)
        if (index === -1)
            index = this._keys.length

        this._keys[index] = key
        this._values[index] = value

        return this
    }

    public has(key: K): boolean {
        const index = indexOf(this._keys, key)
        return index > -1
    }

    public delete(key: K): boolean {

        const index = indexOf(this._keys, key)

        const exists = index > -1
        if (exists) {
            this._keys.splice(index, 1)
            this._values.splice(index, 1)
        }

        return exists
    }

    public clear(): void {
        this._keys.length = 0
        this._values.length = 0
    }

    public forEach(
        func: (value: V, key: K, map: ValueMap<K, V>) => void
    ): void {
        for (const [key, value] of this)
            func(value, key, this)
    }

    public get size(): number {
        return this._keys.length
    }

    public * keys(): Iterator<K> {
        for (let i = 0; i < this.size; i++) {
            const id = this._keys[i]
            yield id
        }
    }

    public * values(): Iterator<V> {
        for (let i = 0; i < this.size; i++) {
            const value = this._values[i]
            yield value
        }
    }

    public *[Symbol.iterator](): Iterator<[K, V]> {
        for (let i = 0; i < this.size; i++) {
            const key = this._keys[i]
            const value = this._values[i]

            yield [key, value]
        }
    }

    public [Symbol.toStringTag](): 'ValueMap' {
        return 'ValueMap'
    }

    //  CopyComparable Implementation

    public [$$copy](): ValueMap<K, V> {
        const Type = this.constructor

        const args = []
        for (const keyValue of this)
            args.push(copy(keyValue))

        return new (Type as any)(args) as ValueMap<K, V>
    }

    public [$$equals](right: unknown): right is ValueMap<K, V> {
        const left = this

        if (!(right instanceof ValueMap))
            return false

        if (left.size !== right.size)
            return false

        return equals([...left], [...right])
    }

}

/*** Exports ***/

export default ValueMap

export { ValueMap }