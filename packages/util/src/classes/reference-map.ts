import { nil, optional, Optional } from '../types'

//// Main ////

class ReferenceMap<K extends unknown[], V> implements Map<K,V> {

    //// State ////
    
    private readonly _refs: Map<unknown, ReferenceMap<unknown[], V>> = new Map()

    private _value = optional<V>()

    //// Interface ////
    
    get(refs: K): V | nil {
        return this._get(refs)()
    }

    has(refs: K): boolean {
        return this._get(refs).has
    }

    set(refs: K, value: V): this {
        
        if (refs.length === 0) {
            this._value = optional(value)
            return this
        }

        const [ref, ...nestedRefs] = refs

        let next = this._refs.get(ref)
        if (!next) {
            next = new ReferenceMap()
            this._refs.set(ref, next)
        }

        next.set(nestedRefs, value)
        return this
    }

    delete(refs: K): boolean {

        if (refs.length === 0) {
            const had = this._value.has
            this._value = optional.nil()
            return had
        }
            
        const [ref, ...nestedRefs] = refs

        const next = this._refs.get(ref)
        if (!next)
            return false 

        const had = next.delete(nestedRefs)
        if (next.size === 0)
            this._refs.delete(ref)

        return had
    }

    clear(): void {
        this.delete([] as unknown[] as K)
        return this._refs.clear()
    }

    get size(): number {
        let count = this._value.has ? 1 : 0
        this._refs.forEach(r => {
            count += r.size 
        })
        return count
    }

    //// Iterable ////

    [Symbol.iterator](): IterableIterator<[K,V]> {
        return this._iter()
    }

    * keys(): IterableIterator<K> {
        for (const [key] of this._iter())
            yield key  
    }

    * values(): IterableIterator<V> {
        for (const [,value] of this._iter())
            yield value  
    }

    * entries(): IterableIterator<[K,V]> {
        yield* this._iter()
    }

    forEach(f: (value: V, key: K, map: ReferenceMap<K, V>) => void, thisArg?: unknown): void {
        for (const [k,v] of this._iter())
            f.call(thisArg, v, k, this)
    }
    
    //// StringTag ////

    get [Symbol.toStringTag]() : 'ReferenceMap' {
        return 'ReferenceMap'
    }

    //// Helper ////

    private * _iter(...prefix: unknown[]): IterableIterator<[K,V]> {
        if (this._value.has)
            yield [prefix as K, this._value.value]

        for (const [key, map] of this._refs) 
            yield* map._iter(...prefix, key) as IterableIterator<[K,V]> 
    }
    
    private _get(refs: K): Optional<V> {
        
        if (refs.length === 0)
            return this._value 

        const [ref, ...nestedRefs] = refs

        if (!this._refs.has(ref))
            return optional.nil()

        const next = this._refs.get(ref) as ReferenceMap<unknown[],V>
        return next._get(nestedRefs)
    }

}

//// Exports ////

export default ReferenceMap

export {
    ReferenceMap
}