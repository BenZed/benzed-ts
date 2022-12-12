
import { describe, it } from '@jest/globals'

import { Module } from '../module'
import { Node } from './node-constructor'

import { expectTypeOf } from 'expect-type'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

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

        //@ts-expect-error No overload signatures
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