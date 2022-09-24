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

    public static from<T1>(input: ArrayLike<T1> | Iterable<T1>): Stack<T1> {

        const stack = new Stack<T1>()

        for (const value of iterate(input))
            stack.push(value)

        return stack
    }

    // ArrayLike<T> implementation

    readonly [key: number]: T

    private _length = 0
    public get length(): number {
        return this._length
    }

    // Iterable<T> implementation 

    public *[Symbol.iterator](): Generator<T> {
        yield* iterate(this)
    }

    // Construct<T>

    public constructor (...values: T[]) {
        this.push(...values)
    }

    // Interface

    public push(value: T): number
    public push(...values: T[]): number
    public push(...values: unknown[]): number {

        for (const value of values as T[])
            (this as _Stack<T>)[this._length++] = value

        return values.length
    }

    public pop(): T {

        const index = this._length - 1
        if (index in this === false)
            throw new Error('Stack is empty.')

        const item = this[index] as T
        delete (this as _Stack<T>)[index]

        this._length--

        return item
    }

    public flush(n = this.length): T[] {

        const max = Math.min(n, this.length)

        const items = []
        while (max > items.length)
            items.push(this.pop())

        return items
    }

    public at(index: number): T | undefined {
        const resolved = index < 0 ? index + this._length : index
        return this[resolved]
    }

    public get isEmpty(): boolean {
        return this._length === 0
    }

}

/*** Exports ***/

export default Stack

export {
    Stack,
    StackLike
}