
import { copy, equals } from '@benzed/immutable'
import { it, expect } from '@jest/globals'

import { KeyData, Data } from './modules'
import { Module } from './module'
import { Node } from './node'

import { expectTypeOf } from 'expect-type'

/* eslint-disable  
    @typescript-eslint/ban-types
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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createTestNodeTree = () => Node
    .from({
        grandParent: Node.from({
            parent: Node.from({
                you: Node.from({
                    child: Node.from({
                        grandChild: Node.create()
                    })
                })
            })
        })
    })

//// Tests ////

it('.getNode() throws on bad paths', () => {
    const n1 = createTestNodeTree()
    // @ts-expect-error Bad Path
    expect(() => n1.getNode('badName')).toThrow('Invalid path: badName')
})

it('.setNode() node from a path', () => { 

    const n1 = Node.from(Module.data(0 as const))
    const n2 = n1.setNode('bar', Node.from(Module.data(1 as const)))

    type N2 = Node<[Data<0>], {
        bar: Node<[Data<1>], {}>
    }>

    expectTypeOf(n2).toMatchTypeOf<N2>()
    expect(n2.modules).toHaveLength(1)
    expect(n2.children).toHaveLength(1)
})

it('.setNode() an existing node', () => {

    const ace = Node.from(Module.data('ace' as const))
    const base = Node.from(Module.data('base' as const))

    const n1 = Node.create().setNode('state', ace)
    expect(n1.children).toHaveLength(1) 
    expect(n1.nodes.state.modules[0].data).toEqual('ace')
    expect(n1.getNode('state').getModule(0).getData()).toEqual('ace')

    const n2 = n1.setNode('state', base)
    expect(n2.children).toHaveLength(1) 
    expect(n2.nodes.state.modules[0].data).toEqual('base')
    expect(n2.getNode('state').getModule(0).getData()).toEqual('base')

})

it('.setNode() nested', () => {

    const t1 = Node.from(
        Module.data('root' as const),
    ).setNode(
        'bar', 
        Node.from(Module.data('country', 'Canada' as const))
    )

    const t2 = t1.setNode(
        'bar', 
        node => node.setModule(0, data => data.setData('Spain' as const))
    )

    expectTypeOf(t2).toEqualTypeOf<Node<[Data<'root'>], {
        bar: Node<[KeyData<'country', 'Spain'>], {}>
    }>>()

})

it('.removeNode() from a path', () => {

    const t1 = Node.from({
        one: Node.from(Module.data(1 as const)), 
        two: Node.from(Module.data(2 as const))
    })

    const t2 = t1.removeNode('one') 
    interface T2 extends Node<[], {
        two: Node<[Data<2>], {}>
    }> {}

    expectTypeOf(t2).toEqualTypeOf<T2>()

    expect(t2.nodes).not.toHaveProperty('one')
    expect(t2.nodes).toHaveProperty('two', t2.getNode('two'))
})

it('.addModules()', () => {

    const n1 = Node
        .from(
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
    ]>
    >()
})

it('.swapModules()', () => {

    const n1 = Node.from(
        new Text('A'),
        new Text('B'),
        new Text('C')
    )

    const [a,b,c] = copy(n1.modules)

    const n2 = n1.swapModules(0,1)
    expectTypeOf(n2).toEqualTypeOf<Node<[Text<'B'>, Text<'A'>, Text<'C'>]>>()
    expect(copy(n2.modules)).toEqual([b,a,c])

    const n3 = n1.swapModules(2,0)
    expectTypeOf(n3).toEqualTypeOf<Node<[Text<'C'>, Text<'B'>, Text<'A'>]>>()
    expect(copy(n3.modules)).toEqual([c,b,a])
})

it('.removeModule()', () => {

    const n1 = Node.from(
        new Text('A'),  
        new Text('B')
    )

    const n2 = n1.removeModule(1) 
    expect(n2.modules).toHaveLength(1)
    expectTypeOf(n2).toEqualTypeOf<Node<[Text<'A'>]>>()
})

it('.setModule()', () => {

    const n1 = Node.from(
        new Text('A'),
        new Text('B')
    )
        
    const n2 = n1.setModule(
        0,
        new Text('Ax'),
    )

    type N2 = Node<[Text<'Ax'>, Text<'B'>]>
    expect(n2.modules).toHaveLength(2)
    expectTypeOf(n2).toEqualTypeOf<N2>(n2)
})
    
it('.setModule() with function', () => {

    const n1 = Node
        .from(new Text('A'))
        .setModule(
            0,
            text => text.setText('A!'),
        )

    expect(n1.modules[0].getText()).toEqual('A!')  
    type N1 = Node<[ Text<'A!'> ]>
    
    expectTypeOf(n1).toEqualTypeOf<N1>()
})

it('.insertModules()', () => {

    const n1 = Node.from(
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
    ]>>()

    const n3 = n1.insertModules(0, new Text('Dame'), new Text('Edam'))
    expect(n3.modules).toHaveLength(4)
    expectTypeOf(n3).toEqualTypeOf<Node<[
        Text<'Dame'>,
        Text<'Edam'>,
        Text<'Ace'>,
        Text<'Case'>
    ]>>()
})