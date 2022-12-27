import { copy } from '@benzed/immutable'

import { Module } from './module/module'
import Node from './node'

//// Setup ////

const modules = [
    Module.data(0 as const),
    Module.data(1 as const),
    Module.data(2 as const)
] as const

const children = [
    Node.create(),
    Node.create(),
    Node.from({
        three: Node.from({
            four: Node.create()
        })
    })
] as const

const node = Node.from({
    zero: children[0],
    one: children[1],
    two: children[2]
}, ...modules)

//// Tests ////

it('throws if multiple instances of the same module exist in the parent', () => {
    expect(() => node.addModule(node.modules[0])).toThrow('Parent may only contain single reference of child')
})

test('.modules', () => {
    expect(node.modules.every((m,i) => m === modules[i])).toBe(true)
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

    const node4 = node.nodes.two.nodes.three.nodes.four

    const ancestors = [...children, children[2].nodes.three] as const

    expect(node4.ancestors).toEqual(ancestors)
    expect(Array.from(node4.eachAncestor())).toEqual(ancestors)
})
