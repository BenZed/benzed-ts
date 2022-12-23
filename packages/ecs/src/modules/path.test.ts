
import { Node } from '../node'
import { Module } from '../module'
import { Path, PathsOf, NestedPathsOf } from './path'

import { expectTypeOf } from 'expect-type'

import { it, expect } from '@jest/globals'

//// Tests ////

it('provides path metadata to nodes', () => {

    const n1 = Node
        .from(Module.path('/place'))

    expect(n1.getPath())
        .toEqual('/place')

    expectTypeOf(n1)
        .toEqualTypeOf<Node<[Path<'/place'>]>>()
})

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createTestNodeTree = () => Node.from(
    Node.from(  
        Module.path('/foo')
    ),

    Node.from(
        Module.path('/bar')
    ),

    Node.from( 
        Module.path('/baz'),
        Node.from(
            Module.path('/nerd')
        ),
        Node.from(
            Module.path('/bone'),
            Node.from(
                Module.path('/sass')
            )
        ),
        Node.from(
            Module.path('/ace'),
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
        Module.path('/good'),
        Module.path('/bad')
    )).toThrow('Path cannot be placed with other Path modules')
})

it('all ancestors must have a path', () => {

    expect(() => Node.from(
        Node.from(
            Node.from(
                Module.path('/uh-oh')
            )
        )
    )).toThrow('Every ancestor except the root must have a Path module')
})

describe('Path.validate', () => {

    it('validates paths', () => {
        expect(Path.validate('ace')).toEqual('/ace')
    })

    it('paths cannot contain multiple consecutive /', () => {
        expect(Path.validate('//ace')).toEqual('/ace')
    })

    it('handles only slashes', () => {
        expect(Path.validate('///')).toEqual('/')
    })

    it('removes trailing slash', () => {
        expect(Path.validate('/ace/')).toEqual('/ace')
    })
})