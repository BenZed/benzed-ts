import { copy } from '@benzed/immutable'

import { Module } from '../module/module'
import { Node } from './node'

import { it, test, expect } from '@jest/globals'

//// Setup ////

const modules = [
    Module.data(0 as const),
    Module.data(1 as const),
    Module.data(2 as const)
] as const

const four = Node.Builder.create({})

const three = Node.Builder.create({
    four
})

const children = [
    Node.Builder.create({}), 
    Node.Builder.create({}),
    Node.Builder.create({
        three
    })
] as const

const node = Node.Builder.create({
    zero: children[0],
    one: children[1],
    two: children[2]
}, ...modules)

//// Tests ////

describe('create', () => {
    it('creates nodes', () => {
        const node = Node.Builder.create()
        expect(node).toBeInstanceOf(Node)
        expect(node.nodes).toEqual({}) 
        expect(node.modules).toEqual([])
    })
})

it('throws if multiple instances of the same module exist in the node', () => { 
    expect(() => Node.Builder.create(modules[0], modules[0]))  
        .toThrow(`${Node.name} may only have a single reference of a module.`)
})

test('.modules', () => {  
    expect(node.modules.every((m,i) => m === modules[i]))
        .toBe(true)
})

it('sets node on constructed modules', () => {
    expect(node.modules.every(m => m.node === node)) 
})
 
it('parent is preserved on copy', () => { 
    const node2 = copy(node)
    expect(node2.modules.every(m => !modules.includes(m) && m.node === node2))
        .toBe(true)
})

it('iterates child nodes', () => {
    expect([...node]).toEqual(children) 
})

test('children', () => {
    expect(node.children).toEqual(children)
    expect([...node.eachChild()]).toEqual(children)
})

test('descendents', () => { 

    const descendents = [...children, children[2].nodes.three, children[2].nodes.three.nodes.four] as const

    expect(node.descendents).toEqual(descendents)
    expect([...node.eachDescendent()]).toEqual(descendents)
    expect(node.numDescendents).toEqual(descendents.length)
})

test('ancestors', () => {

    const node3 = node.nodes.two.nodes.three
    const node4 = node3.nodes.four

    const ancestors = [node3, ...children, node] as const

    expect(node4.ancestors).toEqual(ancestors)
    expect(Array.from(node4.eachAncestor())).toEqual(ancestors)
}) 
