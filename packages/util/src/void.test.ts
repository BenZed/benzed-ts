import { isVoid, toVoid, asVoid } from './void'

import { expectTypeOf } from 'expect-type'

//// Setup ////

class Node {
    parent: Node | void = void Node
}

// TODO: Create @benzed/eslint-plugin with prefer-void rule

//// Tests ////

it('is using void instead of null and undefined a good idea?', () => {
    
    const node = new Node() 
    node.parent = void Node 
    
    expect(node.parent)
        .toBe(void Node)
})

it('what about for params', () => {

    function logNode(node: void | Node, depth: void | number): void {
        void node 
        void depth
    }

    logNode() // Optional by default. We don't need the '?' modifier.

    logNode(void Node, void Number) // I don't like void Number as much as void Node.
    logNode(new Node, void 0) // I think I like void 0 less than void Number
})

it('what about for destructuring', () => {

    const nodes: (void | Node)[] = [new Node, void Node, new Node, void Node]

    const [n1 = new Node, n2 = new Node] = nodes

    expect(n1).toBeInstanceOf(Node)
    expect(n2).toBeInstanceOf(Node)
})

it('what about objects', () => {

    interface Options {
        node: void | Node
        value: number
    }

    const options: Options = { value: 100, node: void Node }
    expect(options).toEqual({
        value: 100,
        node: void Node
    })
})

it('isVoid', () => {

    expect(isVoid(undefined)).toBe(true)
    expect(isVoid(null)).toBe(false)
    expect(isVoid(NaN)).toBe(false)
    expect(isVoid(void Number)).toBe(true)
})

it('toVoid', async () => {
    const value = await Promise.resolve(0).then(toVoid)
    expect(value).toEqual(void 0)
})

it('asVoid', () => {

    expect(asVoid(0)).toBe(0)
    expect(asVoid('')).toBe('')
    expect(asVoid(null)).toBe(undefined)
    expect(asVoid(undefined)).toBe(undefined)

    expectTypeOf(asVoid(0)).toMatchTypeOf<number>()
    expectTypeOf(asVoid('')).toMatchTypeOf<string>()
    expectTypeOf(asVoid(false)).toMatchTypeOf<boolean>()

    expectTypeOf(asVoid(null)).toMatchTypeOf<void>()
    expect(asVoid(null)).toEqual(undefined)

    expectTypeOf(asVoid(undefined)).toMatchTypeOf<void>()
    expect(asVoid(undefined)).toEqual(undefined)

    expect(asVoid(NaN)).toEqual(NaN)
    expectTypeOf(asVoid(NaN)).toMatchTypeOf<number>()

})