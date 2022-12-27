
import { Node } from '../node'
import { Module } from './module'
import { NestedPathsOf, PathsOf, $path } from './path'

import { expectTypeOf } from 'expect-type'

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
    
    const tree = Node.from({
        uncle: Node.from(Rank.of('uncle')),
        mom: Node.from(
            {
                you: Node.from(
                    {
                        son: Node.from(
                            Rank.of('son')
                        )
                    },
                    Rank.of('you'),
                ),
                sister: Node.from({
                    neice: Node.from(Rank.of('neice')),
                    nephew: Node.from(Rank.of('nephew'))
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

    const [, node] = createTree()

    type N1Modules = typeof node.modules

    type N1Paths = PathsOf<N1Modules>
    expectTypeOf<N1Paths>().toEqualTypeOf<'/foo' | '/bar' | '/baz'>()
    
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
    const [,you] = createTree()

    const output = you.getPathFrom(you.parent)
    expect(output).toEqual('you')
    expect(output).toEqual(you.name)
})
    
it('.getFromRoot()', () => {   
    const [,you] = createTree()
    
    expect(you.getPathFromRoot()).toEqual('mom/you')
    expect(you.nodes.son.getPathFromRoot()).toEqual('mom/you/son')
})

describe('$path.validate', () => {
    
    it('validates paths', () => {
        expect($path.validate('ace')).toEqual('/ace')
    })
    
    it('paths cannot contain multiple consecutive /', () => {
        expect($path.validate('//ace')).toEqual('/ace')
    })
    
    it('handles only slashes', () => {
        expect($path.validate('///')).toEqual('/')
    })
    
    it('removes trailing slash', () => {
        expect($path.validate('/ace/')).toEqual('/ace')
    })
})
