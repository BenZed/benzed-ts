
import { Module } from './module'
import { Node } from '../node'

import { expectTypeOf } from 'expect-type'

import { it } from '@jest/globals'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Tests ////

describe.skip('module-interface', () => {

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

    let node: Node<[Count, BigCount]>
    let count: Count
    beforeAll(() => {
        const node = Node.from(
            new Count(10),
            new BigCount(10n)
        ) 
    
        count = node.getModule(0)
    
        node.setCount(25)
    })

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