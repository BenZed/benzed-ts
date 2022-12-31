import { it, expect } from '@jest/globals'

import { Node } from '.'
import { Module } from '../module/module'
import { 
    NestedPathsOf, 
    PathsOf, 
    GetNodeAtPath,
    GetNodeAtNestedPath,
    SetNodeAtNestedPath 
} from './path'

import { expectTypeOf } from 'expect-type'
import { Empty } from '@benzed/util'

//// Setup ////

class Rank<S extends string> extends Module<S> { 

    static of<Sx extends string>(rank: Sx): Rank<Sx> {
        return new Rank(rank)
    } 

    getRank(): S {
        return this.data
    }

}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createTree = () => {
    
    const tree = Node.create({
        uncle: Node.create(Rank.of('uncle')),
        mom: Node.create(
            {
                you: Node.create(
                    {
                        son: Node.create(
                            Rank.of('son')
                        )
                    },
                    Rank.of('you'),
                ),
                sister: Node.create({
                    neice: Node.create(Rank.of('neice')),
                    nephew: Node.create(Rank.of('nephew'))
                }, 
                Rank.of('sister'))
            },
            Rank.of('mom')
        )
    })

    const you = tree.getNode('mom').getNode('you')
    return [tree, you] as const
}

it('identifiable nested paths', () => {

    const [root,] = createTree()

    type Root = typeof root
    type RootPaths = PathsOf<Root['nodes']>

    expectTypeOf<RootPaths>().toEqualTypeOf<'uncle' | 'mom'>()
    
    type RootNestedPaths = NestedPathsOf<Root['nodes']>
    expectTypeOf<RootNestedPaths>().toEqualTypeOf<
    | 'uncle'
    | 'mom'
    | 'mom/you'
    | 'mom/you/son' 
    | 'mom/sister'
    | 'mom/sister/neice'
    | 'mom/sister/nephew'
    >()
})

it('.getPathFrom()', () => { 
    const [,you] = createTree()

    expect(you.parent.nodes.you).toBe(you) 

    expect(you.getPathFrom(you.parent)).toEqual('you')
    expect(you.getPathFrom(you.parent)).toEqual(you.name)
    expect(you.nodes.son.getPathFrom(you.parent)).toEqual('you/son')
})

it('.getFromRoot()', () => {   
    const [,you] = createTree()
    expect(you.getPathFromRoot()).toEqual('mom/you')
    expect(you.nodes.son.getPathFromRoot()).toEqual('mom/you/son')
})

it('GetNodeAtPath', () => {

    const [root] = createTree()
    type Root = typeof root
    type Uncle = GetNodeAtPath<Root['nodes'], 'uncle'>
    expectTypeOf<Uncle>().toEqualTypeOf<Node<[Rank<'uncle'>], Empty>>
})

it('GetNodeAtNestedPath', () => {

    const [root] = createTree()
    type Root = typeof root
    type You = GetNodeAtNestedPath<Root['nodes'], 'mom/you'>

    expectTypeOf<You>().toEqualTypeOf<Node<[Rank<'uncle'>], Empty>>
})

it('SetNodeAtNestedPath', () => {

    const [root] = createTree()

    type RootNodes = typeof root.nodes
    type RootNodesSet = SetNodeAtNestedPath<RootNodes, 'mom/you', Node<[Module<0>]>>

    expectTypeOf<RootNodesSet>().toMatchTypeOf<{
        uncle: Node<[Rank<'uncle'>], Empty>
        mom: Node<[Rank<'mom'>], {
            you: Node<[Module<0>], Empty>
            sister: Node<[Rank<'sister'>], {
                neice: Node<[Rank<'neice'>], Empty>
                nephew: Node<[Rank<'nephew'>], Empty>
            }>
        }>
    }>()

})

it('SetNodesAtNestedPath', () => {

    const empty = Node.create()
    type EmptyNodes = typeof empty.nodes 

    type EmptyNodesSet = SetNodeAtNestedPath<EmptyNodes, 'foo/bar/baz', Node<[Module<1>]>>
    expectTypeOf<EmptyNodesSet>().toMatchTypeOf< {
        foo: Node<[], {
            bar: Node<[], {
                baz: Node<[Module<1>], Empty>
            }>
        }>
    }>()
})