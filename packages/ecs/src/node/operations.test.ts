
import { override } from '@benzed/util'
import { copy, equals } from '@benzed/immutable'

import { Modules, KeyData, Data, Path } from '../modules'
import { Module } from '../module'
import { Node } from './node'

import { it, expect } from '@jest/globals'
import { expectTypeOf } from 'expect-type'

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
    .from()
    .add(
        Node.from(  
            new Path('/foo')
        ),
        Node.from(
            new Path('/bar')
        ),
        Node.from( 
            new Path('/baz'),
            Node.from(
                new Path('/nerd')
            ),
            Node.from(
                new Path('/bone'),
                Node.from(
                    new Path('/sass')
                )
            ),
            Node.from(
                new Path('/ace'),
            )
        )  
    )

//// Tests ////

it('.get() from a path', () => {
    const n1 = createTestNodeTree()

    const foo = n1.get('/foo')
    expect(foo).toBe(n1.get(0))
})

it('.get() from a nested path', () => {
    const n1 = createTestNodeTree()

    const sass = n1.get('/baz/bone/sass')
    expect(sass).toBe(n1.get(2).get(2).get(1))
})

it('.get() throws on bad paths', () => {
    const n1 = createTestNodeTree()
    // @ts-expect-error Bad Path
    expect(() => n1.get('/baz/bone1')).toThrow('Invalid path: /baz/bone1')
})

it('.set() node from a path', () => { 

    const n1 = Node.from().add(Module.data(0 as const))
    const n2 = n1.set('/bar', Node.from().add(Module.data(1 as const)))
    expect(n2.getData()).toEqual(0)

    type N2 = Node<[ 
        Data<0>,
        Node<[
            Path<'/bar'>, 
            Data<1>
        ]>
    ]>

    expectTypeOf(n2).toMatchTypeOf<N2>()
    expect(n2.modules).toHaveLength(2)
    expect(n2.get(1)).toEqual(n2.get('/bar'))
})

it('.set() an existing node', () => {

    const ace = Node.from(
        Module.data('ace' as const)
    )
    expect(ace.getData()).toEqual('ace')

    const base = Node.from(  
        Module.data('base' as const)
    )
    expect(base.getData()).toEqual('base')

    override(Modules, 'applyInterface', (original, modules) => original(modules))(() => {

        const n1 = Node.from().set('/state', ace)
        expect(n1.get('/state').getData()).toEqual('ace')
        expect(n1.getData()).toEqual('ace')

        const n2 = n1.set('/state', base)

        expect(n2.get('/state').getData()).toEqual('base')
        // @ts-expect-error bad index
        expect(() => n2.get(1)).toThrow('Invalid')

        expect(n2.modules).toHaveLength(1) 
        expect(n2.get('/state').getData()).toEqual('base')
        expect(n2.getData()).toEqual('base')
    })

})

it('.set() overwrites existing path', () => {

    const hero = Node.from(
        Module
            .data('hero' as const)
    )

    const bar = Node.from(
        new Path('/bar'),
        Module.data('bar' as const)
    )

    const foo = hero.set('/foo', bar)

    expect(foo.numModules).toEqual(2)
    expect(foo.get(1).getPath()).toEqual('/foo')

})

it('.set() nested', () => {

    const t1 = Node.from(
        Module.data('root' as const),
    ).set(
        '/bar', 
        Node.from(Module.data('country', 'Canada' as const))
    )

    const t2 = t1.set(
        '/bar', 
        node => node.set(1, data => data.setData('Spain' as const))
    )

    expectTypeOf(t2).toEqualTypeOf<Node<[
        Data<'root'>,
        Node<[
            Path<'/bar'>,
            KeyData<'country', 'Spain'>
        ]>
    ]>>()

})

it('.remove() from a path', () => {

    const t1 = Node.from(
        Module.data(0 as const),
        Node.from(
            new Path('/one'), 
            Module.data(1 as const)
        ),
        Node.from(
            new Path('/two'),
            Module.data(2 as const)
        )
    )

    const t2 = t1.remove('/one') 
    interface T2 extends Node<[
        Data<0>,
        Node<[
            Path<'/two'>,
            Data<2>
        ]>
    ]> {}

    expectTypeOf(t2).toEqualTypeOf<T2>()

    expect(t2.modules).not.toContain(t1.get('/one'))
    expect(t2.modules[0]).toEqual(t1.get(0))
    expect(t2.modules[1].data).toEqual(t1.get('/two').data)
})

it('.add()', () => {

    const n1 = Node
        .from(
            new Text('1st'),
            new Text('2nd')
        )

    const n2 = n1.add(
        new Text('3rd')
    )
 
    const n3 = n2.add(
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

it('.swap()', () => {

    const n1 = Node.from(
        new Text('A'),
        new Text('B'),
        new Text('C')
    )

    const [a,b,c] = copy(n1.modules)

    expect(copy(n1.swap(0,1).modules)).toEqual([b,a,c])
    expect(copy(n1.swap(2,0).modules)).toEqual([c,b,a])
})

it('.remove()', () => {

    const n1 = Node.from(
        new Text('A'),  
        new Text('B')
    )

    const n2 = n1.remove(1) 
    expect(n2.modules).toHaveLength(1)
    expectTypeOf(n2).toEqualTypeOf<Node<[Text<'A'>]>>()
})

it('.set()', () => {

    const n1 = Node.from(
        new Text('A'),
        new Text('B')
    )
        
    const n2 = n1.set(
        0,
        new Text('Ax'),
    )

    const n3: Node<[Text<'Ax'>, Text<'B'>]> = n2

    expect(n2.modules).toHaveLength(2)
    expectTypeOf(n2).toEqualTypeOf<Node<[Text<'Ax'>, Text<'B'>]>>(n3)
})
    
it('.set() with function', () => {

    const n1 = Node.from(new Text('A'))
        .set(
            0,
            text => text.setText('A!'),
        )

    expect(n1.getText()).toEqual('A!')  

    const r1 = Node
        .from()
        .add(
            new Text('Hello'),
            new Text('World') 
        )
        .add(
            Node
                .from()
                .add(new Text('!')) 
        )

    const r2 = r1
        .set(0, t => t.setText('Hi'))
        .set(2, n => n.add(new Text('!')))

    expect(r2.get(2).modules.length).toEqual(2)
    expectTypeOf(r2).toEqualTypeOf<

    Node<[
        Text<'Hi'>, 
        Text<'World'>, 
        Node<[
            Text<'!'>, 
            Text<'!'>
        ]>
    ]>

    >()
            
})

it('.insert()', () => {

    const n1 = Node.from(
        new Text('Ace'),
        new Text('Case')
    )

    const n2 = n1.insert(1, new Text('Base'))
    expect(n2.modules).toHaveLength(3)

    expect(equals(n2.modules, [new Text('Ace'), new Text('Base'), new Text('Case')]))
        .toEqual(true)

    expectTypeOf(n2).toEqualTypeOf<Node<[
        Text<'Ace'>,
        Text<'Base'>,
        Text<'Case'>
    ]>>()

    const n3 = n1.insert(0, new Text('Dame'), new Text('Edam'))
    expect(n3.modules).toHaveLength(4)
    expectTypeOf(n3).toEqualTypeOf<Node<[
        Text<'Dame'>,
        Text<'Edam'>,
        Text<'Ace'>,
        Text<'Case'>
    ]>>()
})