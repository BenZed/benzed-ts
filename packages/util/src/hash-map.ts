
/*** Main ***/

/**
 * A map of values where keys are considered via their hash-equality. 
 */
class HashMap<K,V> implements Map<K, V> {

    private _cache: { [key: string]: V } = {}

    // Constructor 
    
    constructor (keyValues: [K, V][] = []) {
    
        if (keyValues) {
            for (const keyValue of keyValues) {
                const [key, value] = keyValue
                this.set(key, value)
            }
        }
    }
    
    // Interface
    
    get(key: K): V | undefined {
        return this._cache[this._getStringKey(key)]
    }
    
    set(key: K, value: V): this {
        this._cache[this._getStringKey(key)] = value
        return this
    }
    
    has(key: K): boolean {
        return this._getStringKey(key) in this._cache
    }
    
    delete(key: K): boolean {

        const _key = this._getStringKey(key)

        const exists = _key in this._cache

        delete this._cache[_key]

        return exists
    }
    
    clear(): void {
        this._cache = {}
    }
    
    forEach(
        func: (value: V, key: K, map: HashMap<K, V>) => void
    ): void {
        for (const [key, value] of this)
            func(value, key, this)
    }
    
    get size(): number {
        return this._stringKeys().length
    }
    
    * keys(): IterableIterator<K> {
        for (const key of this._stringKeys())
            yield JSON.parse(key)
    }
    
    * values(): IterableIterator<V> {
        for (const key of this._stringKeys())
            yield this._cache[key]
    }
    
    * entries(): IterableIterator<[K,V]> {
        for (const key of this._stringKeys()) {
            yield [
                JSON.parse(key), 
                this._cache[key]
            ]
        }
    }
    
    /*** Helper ***/
    
    protected _getStringKey(key: K): string {
        return JSON.stringify(key)
    }

    protected _stringKeys(): string[] {
        return Object.keys(this)
    }
    
    /*** Symolic ***/
    
    *[Symbol.iterator](): IterableIterator<[K, V]> {
        yield* this.entries()
    }
    
    [Symbol.toStringTag] = `JsonMap`
    
}

/*** Exports ***/

export default HashMap

export {
    HashMap
}