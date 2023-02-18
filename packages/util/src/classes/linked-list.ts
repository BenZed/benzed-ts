
/* eslint-disable @typescript-eslint/unified-signatures */

import { each } from '../each'

//// Types ////

// Private
interface _LinkedItem<T> {

    value: T
    next: _LinkedItem<T> | null
    prev: _LinkedItem<T> | null

}

// Public
type LinkedItem<T> = {

    readonly [K in keyof _LinkedItem<T>]: K extends 'value'
        /**/ ? _LinkedItem<T>[K]
        /**/ : LinkedItem<T> | null

}

//// Main ////

class LinkedList<T> implements Iterable<LinkedItem<T>>{

    static from<T1>(
        input: ArrayLike<T1> | Iterable<T1>
    ): LinkedList<T1> {
        return new LinkedList(...each(input))
    }

    // State 

    private _first: _LinkedItem<T> | null = null
    get first(): LinkedItem<T> {
        return this._find(this._first, true).item
    }

    private _last: _LinkedItem<T> | null = null
    get last(): LinkedItem<T> {
        return this._find(this._last, true).item
    }

    private _size = 0
    get size(): number {
        return this._size
    }

    get isEmpty(): boolean {
        return this._size === 0
    }

    // Construct 

    constructor (...values: T[]) {
        for (const value of values)
            this.append(value)
    }

    // Interface 

    append(value: T): LinkedItem<T> {
        return this.insert(value, this._size)
    }

    insert(value: T, index: number | LinkedItem<T>): LinkedItem<T> {

        const newItem: _LinkedItem<T> = { value, next: null, prev: null }

        const isAppendIndex = index === this._size
        const isInitialInsert = this.isEmpty && isAppendIndex
        if (!isInitialInsert && isAppendIndex) {
            const lastItem = this._last as _LinkedItem<T>

            lastItem.next = newItem
            newItem.prev = lastItem

        } else if (!isInitialInsert && !isAppendIndex) {

            const { item: oldItem } = this._find(index, true)

            newItem.prev = oldItem.prev
            if (newItem.prev)
                newItem.prev.next = newItem

            newItem.next = oldItem
            oldItem.prev = newItem
        }

        if (newItem.prev === null)
            this._first = newItem

        if (newItem.next === null)
            this._last = newItem

        this._size++

        return newItem
    }

    remove(input: number | LinkedItem<T> = Math.max(this.size - 1, 0)): T {

        const { item } = this._find(input, true)

        if (item.next)
            item.next.prev = item.prev
        else
            this._last = item.prev

        if (item.prev)
            item.prev.next = item.next
        else
            this._first = item.next

        item.prev = item.next = null

        this._size--

        return item.value
    }

    clear(): T[] {
        const values: T[] = []

        while (this._first) {
            values.push(
                this.remove(this._first)
            )
        }

        return values
    }

    at(index: number): LinkedItem<T> | null {
        const result = this._find(index, false)
        return result ? result.item : null
    }

    has(value: T): boolean {
        return this.indexOf(value) >= 0
    }

    indexOf(value: T): number {
        // Fix this TODO
        for (const [item, index] of this.entries()) {
            if (item.value === value)
                return index
        }

        return -1
    }

    find(predicate: (input: LinkedItem<T>, index: number) => boolean): LinkedItem<T> | null {
        for (const [item, index] of this.entries()) {
            if (predicate(item, index))
                return item
        }

        return null
    }

    // Iterable 

    *[Symbol.iterator](): Generator<LinkedItem<T>> {
        for (const [item] of this.entries())
            yield item
    }

    * items(): Generator<LinkedItem<T>> {
        yield* this
    }

    * values(): Generator<T> {
        for (const item of this)
            yield item.value
    }

    * entries(): Generator<[item: LinkedItem<T>, index: number]> {
        yield* this._iterate(true)
    }

    // Helper 

    private * _iterate(
        forward: boolean
    ): Generator<[item: _LinkedItem<T>, index: number]> {

        let index = forward ? 0 : this._size - 1
        let current = forward ? this._first : this._last
        const delta = forward ? 1 : -1
        const nextKey = forward ? 'next' : 'prev'

        while (current) {
            yield [current, index]
            current = current[nextKey]
            index += delta
        }
    }

    private _find<A extends boolean = true>(
        at: _LinkedItem<T> | number | null,
        assert: A
    ): { item: A extends true ? _LinkedItem<T> : _LinkedItem<T> | null, index: number } {

        type Output = {
            item: A extends true ? _LinkedItem<T> : _LinkedItem<T> | null
            index: number
        }

        const isIndex = typeof at === 'number'
        if (isIndex && at as number < 0)
            at = at as number + this.size

        // iterate backwards optimizations:
        // - index is in the upper end of the collection
        // - lastItem was passed as a key
        const forward = isIndex
            ? at as number <= this._size / 2
            : at !== this._last

        let found = { item: null, index: -1 } as Output
        for (const [item, index] of this._iterate(forward)) {
            if (at === item || at === index) {
                found = { item, index } as Output
                break
            }
        }

        if (assert && !found.item) {
            throw new Error(
                typeof at === 'object'
                    ? 'Item not in list.'
                    : this.isEmpty
                        ? 'List is empty.'
                        : `No value at index ${at}.`
            )
        }

        return found
    }

}

//// Exports ////

export default LinkedList

export {
    LinkedList,
    LinkedItem
}