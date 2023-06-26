import { Func } from '@benzed/util/src/types'
import { nil } from '@benzed/util/src/types/nil'

//// Types ////

type ArrayMethod<T, O = unknown> = (value: T, index: number, array: T[]) => O

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

    [Symbol.iterator]() {
        return this
    }
    
    //// Convenience Methods ////
    
    toArray(): T[] {
        return Array.from(this)
    }

    filter<F extends ArrayMethod<T, boolean>>(filterer: F): T[] {
        return this.toArray().filter(filterer)
    }
        
    map<F extends ArrayMethod<T>>(mapper: F): ReturnType<F>[] {
        return this.toArray().map(mapper) as ReturnType<F>[]
    }

    do(withEach: ArrayMethod<T, void | unknown>): void {
        return this.toArray().forEach(withEach)
    }
    find<Tx extends T>(predicate: (value: T) => value is Tx): Tx | nil 
    find(predicate: (value: T) => boolean): T | nil 
    find(predicate: Func) {

        for (const item of this) {
            if (predicate(item))
                return item
        }

        return nil
    }

    count(): number {
        return this.toArray().length
    }

}

