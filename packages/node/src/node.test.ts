import { nil } from '@benzed/util'
import { Node } from './node'

import { it, describe, expect } from '@jest/globals'
import { NodeMap } from './node-map'
import { NodeSet } from './node-set'

//// Tests ////

describe('Node.from', () => {

    it('wraps node around any value', () => {
        const one = Node.from(1)
        expect(one).toBeInstanceOf(Node)
        expect(one).not.toBeInstanceOf(NodeMap)
        expect(one).not.toBeInstanceOf(NodeSet)
    })

    class Foo {

        get node(): Node<Foo> | nil {
            return Node.for(this) as Node<Foo> | nil
        }

        bar(): string {
            return `${this.node?.name}!`
        }

    }
    
    it('wraps node around any object', () => {

        const foo = new Foo()  
        const node = Node.from(foo) 
        expect(foo.node).toEqual(node)
        expect(foo.bar()).toEqual('Node!')
    
        expect(node).toBeInstanceOf(Node)
        expect(node).not.toBeInstanceOf(NodeMap)
        expect(node).not.toBeInstanceOf(NodeSet)
    })

    it('wraps an array of objects', () => {

        const arr = [ new Foo(), 'string', { some: 'object' } ] as const

        const node = Node.from(arr)

        const [ foo,, obj ] = arr    
 
        expect(foo.node).toEqual(node)
        expect(Node.for(obj)).toEqual(node)
    })

})