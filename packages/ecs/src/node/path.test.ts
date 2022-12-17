import { Path, PathsOf, NestedPathsOf } from './path'
import { Node } from './node'

import { Module } from '../module'
import { Modules } from '../modules'

import { it, expect } from '@jest/globals'
import { expectTypeOf } from 'expect-type'

//// Tests ////

it('provides path metadata to nodes', () => {

    const n1 = Node
        .create()
        .add(Path.create('/place'))

    expect(n1.getPath())
        .toEqual('/place')

    expectTypeOf(n1)
        .toEqualTypeOf<Node<[Path<'/place'>]>>()
})

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createTestNodeTree = () => Node
    .create()
    .add(

        Node.create(  
            Path.create('/foo')
        ),

        Node.create(
            Path.create('/bar')
        ),

        Node.create( 
            Path.create('/baz'),

            Node.create(
                Path.create('/nerd')
            ),

            Node.create(
                Path.create('/bone'),
                Node.create(
                    Path.create('/sass')
                )
            ),

            Node.create(
                Path.create('/ace'),
            )
        )
    )

it('identifiable nested paths', () => {

    const n1 = createTestNodeTree()
    const n1Modules = n1.modules
    type N1Modules = typeof n1Modules

    type N1Paths = PathsOf<N1Modules>
    expectTypeOf<N1Paths>()
        .toEqualTypeOf<'/foo' | '/bar' | '/baz'>()
    
    type N1NestedPaths = NestedPathsOf<N1Modules>
    expectTypeOf<N1NestedPaths>().toEqualTypeOf<
    | '/foo' 
    | '/bar'  
    | '/baz' 
    | '/baz/nerd' 
    | '/baz/bone' 
    | '/baz/bone/sass'  
    | '/baz/ace' 
    >()
}) 

it('.getPathFrom()', () => {
    const n1 = createTestNodeTree()

    const [path] = n1 
        .get(2)
        .get(2)
        .get(1)
        .find(Path, 'children', true)

    expect(n1.root).toEqual(n1)
    const output = path.getPathFrom(n1.get(2)) 

    expect(output).toEqual('/bone/sass')
})

it('.getFromRoot()', () => {   
    const n1 = createTestNodeTree()

    const n2 = n1 
        .get(2)
        .get(2)
        .get(1)

    const path = n2.modules.find(c => c instanceof Path)
    expect(path?.getPathFromRoot()).toEqual('/baz/bone/sass')
})

it('must be the only path module in parent', () => {
    expect(() => new Modules(
        new Path('/good'),
        new Path('/bad')
    )).toThrow('Path cannot be placed with other Path modules')
})

it('all ancestors must have a path', () => {

    expect(() => new Modules(
        new Modules(
            new Modules(
                new Path('/uh-oh')
            )
        )
    )).toThrow('Every ancestor except the root must have a Path module')
})

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

it('.set() from a path', () => { 

    const n1 = Node.create().add(new Module(0 as const))
    const n2 = n1.set('/bar', Node.create().add(new Module(1 as const)))

    type N2 = Node<[
        Module<0>,
        Node<[
            Path<'/bar'>, 
            Module<1>
        ]>
    ]>

    expectTypeOf(n2).toMatchTypeOf<N2>()
    expect(n2.modules).toHaveLength(2)
    expect(n2.get(1)).toEqual(n2.get('/bar'))
})