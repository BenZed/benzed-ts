
/*** Main ***/

class JsonMap<K,V> implements Map<K, V> {

    private _cache: { [key: string]: V } = {}

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
        return this._cache[this._getStringKey(key)]
    }
    
    public set(key: K, value: V): this {
        this._cache[this._getStringKey(key)] = value
        return this
    }
    
    public has(key: K): boolean {
        return this._getStringKey(key) in this._cache
    }
    
    public delete(key: K): boolean {

        const _key = this._getStringKey(key)

        const exists = _key in this._cache

        delete this._cache[_key]

        return exists
    }
    
    public clear(): void {
        this._cache = {}
    }
    
    public forEach(
        func: (value: V, key: K, map: JsonMap<K, V>) => void
    ): void {
        for (const [key, value] of this)
            func(value, key, this)
    }
    
    public get size(): number {
        return this._stringKeys().length
    }
    
    public * keys(): IterableIterator<K> {
        for (const key of this._stringKeys())
            yield JSON.parse(key)
    }
    
    public * values(): IterableIterator<V> {
        for (const key of this._stringKeys())
            yield this._cache[key]
    }
    
    public * entries(): IterableIterator<[K,V]> {
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
    
    public *[Symbol.iterator](): IterableIterator<[K, V]> {
        yield* this.entries()
    }
    
    public [Symbol.toStringTag] = 'JsonMap'
    
}

/*** Exports ***/

export default JsonMap

export {
    JsonMap
}