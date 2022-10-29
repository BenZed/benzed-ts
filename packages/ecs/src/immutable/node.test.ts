import { Node } from './node'
import { Module } from './module'

import { expectTypeOf } from 'expect-type'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

it(`is sealed`, () => {

    // @ts-expect-error Sealed
    void class extends Node<[], []> {}
})

it(`.create()`, () => {
    const node = Node.create()
    expect(node).toBeInstanceOf(Node)
})

describe(`.addModule()`, () => {

    const module = new Module()
    
    const node1 = Node.create()
    const node2 = node1.addModule(module)

    it(`adds a module`, () => {

        expect(node2.modules).toHaveLength(1)
        expectTypeOf(node2).toEqualTypeOf<Node<[Module],{}>>()
    })

    it(`makes immutable copies`, () => {
        expect(node2).not.toBe(node1)
        expect(node2.modules[0]).toBeInstanceOf(Module)
    })

    it(`sets module node`, () => {
        expect(node2.modules[0].node).toBe(node2)
    })

    it(`cannot add a module that\'s parented to another node`, () => {
        const node3 = Node.create()

        const module2 = node2.modules[0]

        expect(() => node3.addModule(module2))
            .toThrow(`Module is already parented, copy it first.`)

        expect(() => node3.addModule(module2.copy()))
            .not.toThrow()
    })

})

describe(`.addChild()`, () => {

    const node1 = Node.create()
    const node2 = Node.create().addModule(new Module())
    const node3 = node1.addChild(`path`, node2)

    it(`adds a child to the node`, () => {
        expect(node3.getChild(`path`)).toEqual(node2)
    })

})