
import { copy, equals } from '@benzed/immutable'

import { Module } from '../module'
import { Node } from './node'

import { expectTypeOf } from 'expect-type'

import { describe, it } from '@jest/globals'

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

    const node = Node.from(
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

    it('gets State setters', () => {
        const n1 = Node.from(
            Module.data(100)
        )

        const state = n1.getData()
        expect(state).toEqual(100)
    })

    it('does not include getters', () => {
        //@ts-expect-error Not defined
        expect(node.count).toEqual(undefined)
    })

    it('interface is preserved on copy', () => {

        const a1 = Node.from(Module.data('ace'))
        expect(a1.getData()).toEqual('ace')

        const a2 = a1.set(0, data => data.setData('base'))
        expect(a2.getData()).toEqual('base')
    })

    // move me to key-data.test.ts
    it('modules may declare parent-aware signatures', () => {

        const node = Node.from(
            Module.data('left', 0 as const),
            Module.data('right', 1 as const)
        )

        const leftValue = node.getData('left')
        // @ts-expect-error Bad signature
        node.getData()
        expect(leftValue).toEqual(0)

        const leftModule = node.get(0)
        expect(leftModule.getData()).toEqual(leftValue)

        const leftRedundant = leftModule.getData('left')
        expect(leftRedundant).toEqual(leftValue)

        const rightValue = node.getData('right')
        expect(rightValue).toEqual(1)
        const rightModule = node.get(1)
        expect(rightModule.getData()).toEqual(rightValue)
    })

})

describe('operations', () => {

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
})