
import { describe, it } from '@jest/globals'

import { Module } from '../module'
import { Node } from './node'

import { expectTypeOf } from 'expect-type'
import { copy } from '@benzed/immutable'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Setup ////

class Text<T extends string> extends Module<T> {

    get text(): T {
        return this.state
    }

    setText<Tx extends string>(text: Tx): Text<Tx> {
        return new Text(text)
    }

    getText(): T {
        return this.text
    }

}  

//// Tests ////

describe('NodeInterface', () => {

    class Count extends Module<void> {

        constructor(private _count: number) {
            super()
        }

        get count(): number {
            return this._count
        }

        getCount(): number {
            return this.count
        }

        setCount(number: number): void {
            this._count = number
        }
    }

    class BigCount extends Module<void> {
        constructor(private _count: bigint) {
            super()
        }

        get count(): bigint {
            return this._count
        }

        getCount(): bigint {
            return this.count
        }

        setCount(bigInt: bigint): void {
            this._count = bigInt
        }
    }

    const node = Node.create(
        new Count(10),
        new BigCount(10n)
    )

    const [ count ] = node.modules

    node.setCount(25)
    
    it('is defined by it\'s modules', () => {
        expect(count.getCount()).toEqual(25)
        expect(node.getCount()).toEqual(25)
    })

    it('first modules take precedence', () => {
        type GetCountParameters = Parameters<typeof node.setCount>[0]
        expectTypeOf<GetCountParameters>().toMatchTypeOf<number>()
 
        // @ts-expect-error No overload signatures
        node.setCount(25n)

        count.setCount(25)
        expect(node.getCount()).toEqual(25)
        expect(count.getCount()).toEqual(25)
    })

    it('does not include getters', () => {
        //@ts-expect-error Not defined
        expect(node.count).toEqual(undefined)
    })

})

describe('operations', () => {

    it('.add()', () => {

        const n1 = Node
            .create(
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

        const n1 = Node.create(
            new Text('A'),
            new Text('B'),
            new Text('C')
        )

        const [a,b,c] = copy(n1.modules)

        expect(copy(n1.swap(0,1).modules)).toEqual([b,a,c])
        expect(copy(n1.swap(2,0).modules)).toEqual([c,b,a])

    })

    it('.remove()', () => {

        const n1 = Node.create(
            new Text('A'),
            new Text('B')
        )

        const n2 = n1.remove(1)
        expect(n2).toHaveLength(1)
        expectTypeOf(n2).toEqualTypeOf<Node<[Text<'A'>]>>()
    })
    
})