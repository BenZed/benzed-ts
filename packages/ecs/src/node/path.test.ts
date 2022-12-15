import { Path, PathsOf, NestedPathsOf } from './path'
import { Node } from './node'

import { expectTypeOf } from 'expect-type'

////  ////

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

const n1 = Node
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
            Node .create(
                Path.create('/ace'),
            )
        )
    )

it('identifiable nested paths', () => {

    const n1Modules = n1.modules
    type N1Modules = typeof n1Modules

    type N1Paths = PathsOf<N1Modules>
    expectTypeOf<N1Paths>()
        .toEqualTypeOf<'/foo' | '/bar' | '/baz'>()
    
    type N1NestedPaths = NestedPathsOf<N1Modules>
    expectTypeOf<N1NestedPaths>()
        .toEqualTypeOf<
    '/foo' | 
    '/bar' | 
    '/baz' | 
    '/baz/nerd' | 
    '/baz/bone' |
    '/baz/bone/sass' | 
    '/baz/ace'
    >()
})

it('.getPathFrom()', () => {
    const path = n1
        .get(2)
        .get(2)
        .get(1)
        
    const output = path.getPathFrom(n1.get(2)) 

    expect(output).toEqual('/bone/sass')
})

it('.getFromRoot()', () => {

    const path = n1 
        .get(2)
        .get(2)
        .get(1)
        .getPathFromRoot()
 
    expect(path).toEqual('/baz/bone/sass')
})

it.todo('.get() from a nested path')