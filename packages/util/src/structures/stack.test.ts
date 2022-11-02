import { Stack } from './stack'

it('is a stack', () => {
    const stack = new Stack<number>(1)

    expect(stack).toHaveLength(1)
    expect(stack[0]).toEqual(1)
})

it('push(v)', () => {
    const stack = new Stack()

    stack.push(1)

    expect(stack).toHaveLength(1)
    expect(stack[0]).toEqual(1)
})

it('push(...v)', () => {

    const stack = new Stack<string>()

    stack.push('hey', 'ho')
    expect(stack).toHaveLength(2)
    expect(stack[0]).toEqual('hey')
    expect(stack[1]).toEqual('ho')
})

it('pop()', () => {

    const stack = new Stack<boolean>(true)

    expect(stack.pop()).toEqual(true)
    expect(stack).toHaveLength(0)
})

it('pop() errors on empty', () => {
    const stack = new Stack()

    expect(() => stack.pop()).toThrow('Stack is empty')
})

it('flush()', () => {

    const stack = new Stack(1, 2)
    expect(stack).toHaveLength(2)

    expect(stack.flush()).toEqual([2, 1])
    expect(stack).toHaveLength(0)
})

it('flush(n)', () => {

    const stack = new Stack(1, 2)
    expect(stack).toHaveLength(2)

    expect(stack.flush(1)).toEqual([2])
    expect(stack).toHaveLength(1)
})

it('flush(n > length) doesn\'t throw', () => {

    const stack = new Stack(1, 2)

    expect(stack.flush(3)).toEqual([2, 1])
})

it('flush(n < 0) doesn\'t throw', () => {

    const stack = new Stack(1, 2)

    expect(stack.flush(-1)).toEqual([])
})

it('is iterable', () => {

    const input = ['hello', 'how', 'are', 'you']

    const stack = new Stack<string>(...input)

    expect([...stack]).toEqual(input)
})

it('isEmpty', () => {

    const stack = new Stack()

    expect(stack.isEmpty).toBe(true)

    stack.push(1)
    expect(stack.isEmpty).toBe(false)

    stack.pop()
    expect(stack.isEmpty).toBe(true)

})

it('readonly index signature', () => {

    const stack = new Stack(1, 2, 3)
    // @ts-expect-error Keys cannot be deleted
    delete stack[0]
})

describe('at(n)', () => {

    const numbers = [0, 1, 2]
    const input = numbers.slice(1)
    const stack = new Stack(...input)
    const indexes = [...numbers.map(i => -(i + 1)).reverse(), ...numbers]

    for (const index of indexes) {
        it(
            `Stack(${input}).at(${index}) === ${input.at(index)}`, () => {
                expect(stack.at(index)).toEqual(input.at(index))
            })
    }

})

it('Stack.from(iterable)', () => {

    const input = [1, 2, 3, 4]

    expect([...Stack.from(input)]).toEqual([...input])
})

it('Stack.from(arrayLike)', () => {

    const arrayLike = { length: 2, 0: true, 1: false }

    const chars = Stack.from(arrayLike)

    expect([...chars]).toEqual([true, false])

})

it('Stack.from("hello")', () => {

    const chars = Stack.from('hello')

    expect([...chars]).toEqual([...'hello'])

})