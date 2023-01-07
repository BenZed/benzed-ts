
/* eslint-disable 
    @typescript-eslint/no-this-alias,
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/prefer-readonly-parameter-types
*/

//// Main ////

/**
 * A Value Map implements the same interface as Map, 
 * allowing customization of key equality calculation behaviour.
 */
abstract class ValueMap<K, V> implements Map<K,V> {

    // State 

    protected _keys: K[] = []
    protected _values: V[] = []

    // Constructor 

    constructor (keyValues: [K, V][] = []) {

        if (keyValues) {
            for (const keyValue of keyValues) {
                const [key, value] = keyValue
                this.set(key, value)
            }
        }
    }

    // Abstract

    /**
     * Should return true if both keys are equal.
     */
    protected abstract _keysEqual(l: K, r: K): boolean

    // Interface

    get(key: K): V | undefined {
        const index = this._getValueIndex(key)
        return this._values[index]
    }

    set(key: K, value: V): this {

        let index = this._getValueIndex(key)
        if (index === -1)
            index = this._keys.length

        this._keys[index] = key
        this._values[index] = value

        return this
    }

    has(key: K): boolean {
        const index = this._getValueIndex(key)
        return index > -1
    }

    delete(key: K): boolean {

        const index = this._getValueIndex(key)

        const exists = index > -1
        if (exists) {
            this._keys.splice(index, 1)
            this._values.splice(index, 1)
        }

        return exists
    }

    clear(): void {
        this._keys.length = 0
        this._values.length = 0
    }

    forEach(
        func: (value: V, key: K, map: ValueMap<K, V>) => void
    ): void {
        for (const [key, value] of this)
            func(value, key, this)
    }

    get size(): number {
        return this._keys.length
    }

    * keys(): IterableIterator<K> {
        for (let i = 0; i < this.size; i++) {
            const id = this._keys[i]
            yield id
        }
    }

    * values(): IterableIterator<V> {
        for (let i = 0; i < this.size; i++) {
            const value = this._values[i]
            yield value
        }
    }

    * entries(): IterableIterator<[K,V]> {

        for (let i = 0; i < this.size; i++) {
            const value = this._values[i]
            const key = this._keys[i]
            yield [key, value]
        }
    }

    //// Helper ////

    protected _getValueIndex(key: K): number {
        for (let i = 0; i < this.size; i++) {
            const _key = this._keys[i]
            if (this._keysEqual(key, _key))
                return i 
        }
        return -1
    }

    //// Symolic ////

    *[Symbol.iterator](): IterableIterator<[K, V]> {
        yield* this.entries()
    }

    get [Symbol.toStringTag](): 'ValueMap' {
        return 'ValueMap'
    }

}

//// ValuesMap ////

/**
 * Value Map based on the identicaly of given arrays
 */
class ValuesMap<K extends unknown[], V> extends ValueMap<K, V> {

    protected _keysEqual(l: K, r: K): boolean {
        if (l.length !== r.length)
            return false 
            
        for (let i = 0; i < l.length; i++) {
            if (l[i] !== r[i])
                return false
        }

        return true
    }

}

//// Exports ////

export default ValueMap

export { 
    ValueMap,
    ValuesMap
}