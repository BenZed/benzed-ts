import iterate from './iterate'

/*** Internal Types ***/

/**
 * Mutable numeric index signature
 */
interface _Stack<T> {
    [key: number]: T
}

/*** Types ***/

/**
 * Really, the Stack<T> implementation is for fun.
 * All you need is: 
 * ```ts
 * const stack: StackLike<number> = []
 * stack.push(1,2,3,4)
 * stack.pop()
 * ```
 */
interface StackLike<T> extends ArrayLike<T>, Iterable<T> {

    push: Array<T>['push']

    pop: Array<T>['pop']

}

/*** Helper ***/

/*** Custom Implementation ***/

class Stack<T> implements StackLike<T> {

    // Static interface methods

    static from<T1>(input: ArrayLike<T1> | Iterable<T1>): Stack<T1> {

        const stack = new Stack<T1>()

        for (const value of iterate(input))
            stack.push(value)

        return stack
    }

    // ArrayLike<T> implementation

    readonly [key: number]: T

    private _length = 0
    get length(): number {
        return this._length
    }

    // Iterable<T> implementation 

    *[Symbol.iterator](): Generator<T> {
        yield* iterate(this)
    }

    // Construct<T>

    constructor (...values: T[]) {
        this.push(...values)
    }

    // Interface

    push(value: T): number
    push(...values: T[]): number
    push(...values: unknown[]): number {

        for (const value of values as T[])
            (this as _Stack<T>)[this._length++] = value

        return values.length
    }

    pop(): T {

        const index = this._length - 1
        if (index in this === false)
            throw new Error(`Stack is empty.`)

        const item = this[index] as T
        delete (this as _Stack<T>)[index]

        this._length--

        return item
    }

    flush(n = this.length): T[] {

        const max = Math.min(n, this.length)

        const items = []
        while (max > items.length)
            items.push(this.pop())

        return items
    }

    at(index: number): T | undefined {
        const resolved = index < 0 ? index + this._length : index
        return this[resolved]
    }

    get isEmpty(): boolean {
        return this._length === 0
    }

}

/*** Exports ***/

export default Stack

export {
    Stack,
    StackLike
}