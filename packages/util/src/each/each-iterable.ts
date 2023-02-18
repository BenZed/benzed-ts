import { nil } from '../types'

//// Types ////

export type Map<T> = (value: T, index: number, array: T[]) => unknown

export type Filter<T> = (value: T, index: number, array: T[]) => unknown

//// Class ////

export class EachIterable<T> {

    private _current: Iterator<T> | nil
    constructor(private readonly _items: Iterable<T>[]) {
        this._current = nil
    }

    //// Iterator Implementation ////

    next(): IteratorResult<T> {

        const current = this._current ??= this._items.shift()?.[Symbol.iterator]()
        if (!current)
            return { value: nil, done: true }

        const result = current.next()
        if (result.done) {
            this._current = nil
            return this.next()
        }

        return result
    }

    //// Iterable Implementation ////

    protected [Symbol.iterator]() {
        return this
    }
    
    //// Convenience Methods ////
    
    toArray(): T[] {
        return [...this]
    }
        
    map<F extends Map<T>>(mapper: F): ReturnType<F>[] {
        return this.toArray().map(mapper) as ReturnType<F>[]
    }
        
    filter<F extends Filter<T>>(filterer: F): T[] {
        return this.toArray().filter(filterer)
    }

    get count(): number {
        return this.toArray().length
    }

}

