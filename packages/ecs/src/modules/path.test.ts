
import { Node } from '../node'
import { Path, PathsOf, NestedPathsOf } from './path'

import { it, expect } from '@jest/globals'
import { expectTypeOf } from 'expect-type'

//// Tests ////

it('provides path metadata to nodes', () => {

    const n1 = Node
        .from()
        .add(Path.create('/place'))

    expect(n1.getPath())
        .toEqual('/place')

    expectTypeOf(n1)
        .toEqualTypeOf<Node<[Path<'/place'>]>>()
})

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createTestNodeTree = () => Node
    .from()
    .add(
        Node.from(  
            Path.create('/foo')
        ),
        Node.from(
            Path.create('/bar')
        ),
        Node.from( 
            Path.create('/baz'),
            Node.from(
                Path.create('/nerd')
            ),
            Node.from(
                Path.create('/bone'),
                Node.from(
                    Path.create('/sass')
                )
            ),
            Node.from(
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
    expect(n1.root).toEqual(n1)

    const n2 = n1  
        .get(2) 
        .get(2)
        .get(1) 

    for (const n2x of [n2, n2.find.require(Path)]) {
        const output = n2x.getRelativePath(n1.get(2))
        expect(output).toEqual('/bone/sass')
    }
})

it('.getFromRoot()', () => {   
    const n1 = createTestNodeTree()
    const n2 = n1 
        .get(2)
        .get(2)
        .get(1)

    for (const n2x of [n2.find.require(Path), n2]) 
        expect(n2x.getPathFromRoot()).toEqual('/baz/bone/sass')
    
})

it('must be the only path module in parent', () => {
    expect(() => Node.from(
        Path.create('/good'),
        Path.create('/bad')
    )).toThrow('Path cannot be placed with other Path modules')
})

it('all ancestors must have a path', () => {

    expect(() => Node.from(
        Node.from(
            Node.from(
                Path.create('/uh-oh')
            )
        )
    )).toThrow('Every ancestor except the root must have a Path module')
})
