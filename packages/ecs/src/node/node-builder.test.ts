
import { copy, equals } from '@benzed/immutable'
import { Empty } from '@benzed/util'

import { it, expect } from '@jest/globals'

import { Data } from '../modules'
import { Module } from '../module'
import { NodeBuilder as Node, SetNodeBuilderAtPath } from './node-builder'

import { GetNodeAtPath, NestedPathsOf, PathsOf } from './operations'

import { expectTypeOf } from 'expect-type'

/* eslint-disable  
    @typescript-eslint/ban-types,
    @typescript-eslint/explicit-function-return-type
*/

//// Setup ////

class Text<T extends string> extends Module<T> {

    get text(): T {
        return this.data
    }

    setText<Tx extends string>(text: Tx): Text<Tx> {
        return new Text(text)
    }

    getText(): T {
        return this.text
    }
}

//// Setup ////

class Rank<S extends string> extends Module<S> { 

    static of<Sx extends string>(rank: Sx): Rank<Sx> {
        return new Rank(rank)
    } 

    getRank(): S {
        return this.data
    }

}

const createFamilyTree = () => {
    
    const grandChild = Node.build()

    const child = Node.build({
        grandChild
    })

    const you = Node.build({
        child
    })

    const parent = Node.build({
        you
    })

    const grandParent = Node.build({
        parent
    })

    return Node.build({ grandParent })
}

const createFamilyTreeWithModules = () => {

    const uncle = Node.build(Rank.of('uncle'))

    const son = Node.build(
        Rank.of('son')
    )

    const you = Node.build(
        {
            son
        },
        Rank.of('you'),
    )

    const neice = Node.build(Rank.of('neice'))
    const nephew = Node.build(Rank.of('nephew'))
    const sister = Node.build({
        neice,
        nephew
    }, 
    Rank.of('sister'))

    const mom = Node.build(
        {
            you,
            sister
        },
        Rank.of('mom')
    )

    const tree = Node.build({
        uncle,
        mom
    })

    return [tree, tree.getNode('mom').getNode('you')] as const
}

//// Tests ////

it('identifiable nested paths', () => {

    const [root,] = createFamilyTreeWithModules()

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
    const [,you] = createFamilyTreeWithModules()

    expect(you.parent.nodes.you).toBe(you) 

    expect(you.getPathFrom(you.parent)).toEqual('you')
    expect(you.getPathFrom(you.parent)).toEqual(you.name)
    expect(you.nodes.son.getPathFrom(you.parent)).toEqual('you/son')
})

it('.getFromRoot()', () => {   
    const [,you] = createFamilyTreeWithModules()
    expect(you.getPathFromRoot()).toEqual('mom/you')
    expect(you.nodes.son.getPathFromRoot()).toEqual('mom/you/son')
})

it('GetNodeAtPath', () => {

    const [root] = createFamilyTreeWithModules()
    type Root = typeof root
    type Uncle = GetNodeAtPath<Root['nodes'], 'uncle'>
    expectTypeOf<Uncle>().toEqualTypeOf<Node<[Rank<'uncle'>], Empty>>
})

it('GetNodeAtNestedPath', () => {

    const [root] = createFamilyTreeWithModules()
    type Root = typeof root
    type You = GetNodeAtPath<Root['nodes'], 'mom/you'>

    expectTypeOf<You>().toEqualTypeOf<Node<[Rank<'uncle'>], Empty>>
})

it('getNode()', () => {
    const root = createFamilyTree()
    const grandParent = root.getNode('grandParent')

    expectTypeOf(grandParent).toEqualTypeOf(root.nodes.grandParent)
    expect(grandParent).toEqual(root.nodes.grandParent)
})

it('getNode() nested path', () => {
    const root = createFamilyTree()
    const you = root.getNode('grandParent/parent/you')
    expect(you).toEqual(root.nodes.grandParent.nodes.parent.nodes.you)
})

it('.getNode() throws on bad paths', () => {
    const n1 = createFamilyTree()
    // @ts-expect-error Bad Path
    expect(() => n1.getNode('badName')).toThrow('No node at path: badName')
})

it('.setNode() node from a path', () => { 

    const bar = Node.build(Module.data(1 as const))

    const n1 = Node.build(Module.data(0 as const))
    const n2 = n1.setNode('bar', bar)

    type N2 = Node<[Data<0>], {
        bar: Node<[Data<1>], {}>
    }>

    expectTypeOf(n2).toMatchTypeOf<N2>()
    expect(n2.modules).toHaveLength(1)
    expect(n2.children).toHaveLength(1)
})

it('.setNode() an existing node', () => {

    const ace = Node.build(Module.data('ace' as const))
    const base = Node.build(Module.data('base' as const))

    const n1 = Node.build().setNode('state', ace)
 
    expect(n1.children).toHaveLength(1) 
    expect(n1.nodes.state.modules[0].data).toEqual('ace')
    expect(n1.getNode('state').modules[0].getData()).toEqual('ace')

    const n2 = n1.setNode('state', base)
    expect(n2.children).toHaveLength(1) 
    expect(n2.nodes.state.modules[0].data).toEqual('base')
    expect(n2.getNode('state').modules[0].getData()).toEqual('base')

})

it('.setNode() nested path', () => {

    const child = Node.build({})
    const parent = Node.build({ child })
    const root = Node.build({ parent })

    // overwrite with node
    const update1 = Node.build(Module.data(1 as const))
    const root1 = root.setNode('parent/child', update1)
    expect(root1.nodes.parent.nodes.child).toEqual(update1)
    type Root1 = typeof root1
    expectTypeOf<Root1>().toMatchTypeOf<Node<[], {
        parent: Node<[], {
            child: Node<[Data<1>], {}>
        }>
    }>>()

    // overwrite with update function
    const update2 = Node.build(
        Module.data(2 as const)
    )

    const root2 = root1.setNode('parent/child', 
        child => child.setModule(0, 
            data => data.setData(data.data + 1 as 2)
        )
    )

    expect(root2.nodes.parent.nodes.child).toEqual(update2)
    type Root2 = typeof root2
    expectTypeOf<Root2>().toMatchTypeOf<Node<[], {
        parent: Node<[], {
            child: Node<[Data<2>], {}>
        }>
    }>>()

    // set nested new node
    const update3 = Node.build(Module.data(3 as const))
    const root3 = root2.setNode('parent/child2', update3)
    expect(root3.nodes.parent.nodes.child2).toEqual(update3)
    type Root3= typeof root3
    expectTypeOf<Root3>().toMatchTypeOf<Node<[], {
        parent: Node<[], {
            child: Node<[Data<2>], {}>
            child2: Node<[Data<3>], {}>
        }>
    }>>()
})

it('.removeNode() from a path', () => {

    const one = Node.build(Module.data(1 as const))
    const two = Node.build(Module.data(2 as const))

    const t1 = Node.build({
        one, 
        two
    })

    const t2 = t1.removeNode('one') 

    expectTypeOf(t2.nodes).toEqualTypeOf<{
        two: Node<[Data<2>], {}>
    }>()

    expect(t2.nodes).not.toHaveProperty('one')
    expect(t2.nodes).toHaveProperty('two', t2.getNode('two'))
})

it('.addModules()', () => {

    const n1 = Node.build(
        new Text('1st'),
        new Text('2nd')
    )

    const n2 = n1.addModule(
        new Text('3rd')
    )
 
    const n3 = n2.addModules(
        new Text('4th'),
        new Text('5th')
    )
    
    expect(n2.modules).toHaveLength(3)
    expect(n3.modules).toHaveLength(5)
    expectTypeOf(n3).toEqualTypeOf<
    Node<[
        Text<'1st'>,
        Text<'2nd'>,
        Text<'3rd'>,
        Text<'4th'>,
        Text<'5th'>,
    ], {}>
    >()
})

it('.swapModules()', () => {

    const n1 = Node.build(
        new Text('A'),
        new Text('B'),
        new Text('C')
    )

    const [a,b,c] = copy(n1.modules)

    const n2 = n1.swapModules(0,1)
    expectTypeOf(n2).toEqualTypeOf<Node<[Text<'B'>, Text<'A'>, Text<'C'>], {}>>()
    expect(copy(n2.modules)).toEqual([b,a,c])

    const n3 = n1.swapModules(2,0)
    expectTypeOf(n3).toEqualTypeOf<Node<[Text<'C'>, Text<'B'>, Text<'A'>], {}>>()
    expect(copy(n3.modules)).toEqual([c,b,a])
})

it('.removeModule()', () => {

    const n1 = Node.build(
        new Text('A'),  
        new Text('B')
    )

    const n2 = n1.removeModule(1) 
    expect(n2.modules).toHaveLength(1)
    expectTypeOf(n2).toEqualTypeOf<Node<[Text<'A'>], {}>>()
})

it('.setModule()', () => {

    const n1 = Node.build(
        new Text('A'),
        new Text('B')
    )
        
    const n2 = n1.setModule(
        0,
        new Text('Ax'),
    )

    type N2Modules = [Text<'Ax'>, Text<'B'>]
    expect(n2.modules).toHaveLength(2)
    expectTypeOf(n2.modules).toEqualTypeOf<N2Modules>()
})
    
it('.setModule() with function', () => {

    const n1 = Node.build(new Text('A'))
        .setModule(
            0,
            text => text.setText('A!'),
        )

    expect(n1.modules[0].getText()).toEqual('A!')  
    type N1Modules = [ Text<'A!'> ]
    
    expectTypeOf(n1.modules).toEqualTypeOf<N1Modules>()
})

it('.insertModules()', () => {

    const n1 = Node.build(
        new Text('Ace'),
        new Text('Case')
    )

    const n2 = n1.insertModules(1, new Text('Base'))
    expect(n2.modules).toHaveLength(3)

    expect(equals(n2.modules, [new Text('Ace'), new Text('Base'), new Text('Case')]))
        .toEqual(true)

    expectTypeOf(n2).toEqualTypeOf<Node<[
        Text<'Ace'>,
        Text<'Base'>,
        Text<'Case'>
    ], {}>>()

    const n3 = n1.insertModules(0, new Text('Dame'), new Text('Edam'))
    expect(n3.modules).toHaveLength(4)
    expectTypeOf(n3).toEqualTypeOf<Node<[
        Text<'Dame'>,
        Text<'Edam'>,
        Text<'Ace'>,
        Text<'Case'>
    ], {}>>()
})

it('SetNodeAtNestedPath', () => {

    const [root] = createFamilyTreeWithModules()

    type RootNodes = typeof root.nodes
    type RootNodesSet = SetNodeBuilderAtPath<RootNodes, 'mom/you', Node<[Module<0>]>>

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

it('SetNodeBuilderAtPath', () => {

    const empty = Node.build()
    type EmptyNodes = typeof empty.nodes 

    type EmptyNodesSet = SetNodeBuilderAtPath<EmptyNodes, 'foo/bar/baz', Node<[Module<1>]>>
    expectTypeOf<EmptyNodesSet>().toMatchTypeOf< {
        foo: Node<[], {
            bar: Node<[], {
                baz: Node<[Module<1>], Empty>
            }>
        }>
    }>()
})
