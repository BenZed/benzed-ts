
/* eslint-disable @typescript-eslint/unified-signatures */

import iterate from './iterate'

/*** Types ***/

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

/*** Main ***/

class LinkedList<T> implements Iterable<LinkedItem<T>>{

    public static from<T1>(
        input: ArrayLike<T1> | Iterable<T1>
    ): LinkedList<T1> {
        return new LinkedList(...iterate(input))
    }

    // State 

    private _first: _LinkedItem<T> | null = null
    public get first(): LinkedItem<T> {
        return this._find(this._first, true)
    }

    private _last: _LinkedItem<T> | null = null
    public get last(): LinkedItem<T> {
        return this._find(this._last, true)
    }

    private _size = 0
    public get size(): number {
        return this._size
    }

    // Construct 

    public constructor (...values: T[]) {
        for (const value of values)
            this.append(value)
    }

    // Interface 

    public append(value: T): LinkedItem<T> {
        return this.insert(value, this._size)
    }

    public insert(value: T, index: number | LinkedItem<T>): LinkedItem<T> {

        const newItem: _LinkedItem<T> = { value, next: null, prev: null }

        const isAppendIndex = index === this._size
        const isInitialInsert = this.isEmpty && isAppendIndex
        if (!isInitialInsert && isAppendIndex) {
            const lastItem = this._last as _LinkedItem<T>

            lastItem.next = newItem
            newItem.prev = lastItem

        } else if (!isInitialInsert && !isAppendIndex) {

            const oldItem = this._find(index, true)

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

    public remove(input: number | LinkedItem<T>): T {

        const item = this._find(input, true)

        //
        if (item.next)
            item.next.prev = item.prev
        else
            this._last = item.prev

        //
        if (item.prev)
            item.prev.next = item.next
        else
            this._first = item.next

        item.prev = item.next = null

        this._size--

        return item.value
    }

    public at(index: number): LinkedItem<T> | null {
        return this._find(index, false)
    }

    public get isEmpty(): boolean {
        return this._size === 0
    }

    // Iterable 

    public *[Symbol.iterator](): Generator<LinkedItem<T>> {
        for (const [item] of this.entries())
            yield item
    }

    public * items(): Generator<LinkedItem<T>> {
        yield* this
    }

    public * values(): Generator<T> {
        for (const item of this)
            yield item.value
    }

    public * entries(): Generator<[item: LinkedItem<T>, index: number]> {
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
    ): A extends true ? _LinkedItem<T> : _LinkedItem<T> | null {

        const isIndex = typeof at === 'number'
        if (isIndex && at as number < 0)
            at = at as number + this.size

        // iterate backwards optimizations:
        // - index is in the upper end of the collection
        // - lastItem was passed as a key
        const forward = isIndex
            ? at as number <= this._size / 2
            : at !== this._last

        let found: _LinkedItem<T> | null = null
        for (const [item, index] of this._iterate(forward)) {
            if (at === item || at === index) {
                found = item
                break
            }
        }

        if (assert && !found) {
            throw new Error(
                typeof at === 'object'
                    ? 'Item not in list.'
                    : at === 0 || at === this._size
                        ? 'List is empty.'
                        : `No value at index ${at}.`
            )
        }

        return found as A extends true
            ? _LinkedItem<T>
            : _LinkedItem<T> | null
    }

}

/*** Exports ***/

export default LinkedList

export {
    LinkedList,
    LinkedItem
}