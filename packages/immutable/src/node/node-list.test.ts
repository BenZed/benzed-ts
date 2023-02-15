import { NodeList } from './node-list'

import { test, it, expect, describe } from '@jest/globals'
import { Module } from '../module'
import { $$state, getState } from '../state'
import { pick } from '@benzed/util'
import copy from '../copy'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Setup ////

class Data<V> extends Module {

    constructor(
        readonly data: V
    ) {
        super()
    }

    get [$$state](): Pick<this, 'data'> {
        return pick(this, 'data')
    }

}

//// Tests ////

const list = new NodeList(
    new Data(5 as const), 
    new Data('ace' as const)
)

test('new', () => {
    expect(list[0]).toEqual(new Data(5))
    expect(list[1]).toEqual(new Data('ace'))
})

test('length', () => {
    expect(list.length).toEqual(2)
})

test('at', () => {
    expect(list.at(0)).toEqual(list[0])

    // @ts-expect-error Bad index
    expect(() => list.at(-1)).toThrow('is invalid')
})

describe('state', () => {

    it('get', () => {
        const state = getState(list)
        expect(state).toEqual([new Data(5), new Data('ace')])
    }) 

    it('set', () => {
        const state = getState(list)

        const list2 = copy(list) 

        list2[$$state] = { ...state } as typeof list2[typeof $$state]

        expect({ ...list2 }).toEqual({ ...list }) 
        expect(list2[0]).toBeInstanceOf(Data)
        expect(list2[1]).toBeInstanceOf(Data)

    })

})

describe('builder', () => {

    it('add', () => {

        const list2 = list.add(new Data(true as const))

        expect(list2[$$state]).toEqual([new Data(5), new Data('ace'), new Data(true)])
    })

    it('insert', () => {
        const list2 = list.insert(1, new Data(4 as const))
        expect(list2[$$state]).toEqual([new Data(5), new Data(4), new Data('ace')])
    })

    it('swap', () => {
        const list2 = list.swap(0, 1)
        expect(list2[$$state]).toEqual([new Data('ace'), new Data(5)])
    })

    it('remove', () => {
        expect(list.remove(0)[$$state]).toEqual([new Data('ace')])
        expect(list.remove(1)[$$state]).toEqual([new Data(5)])
    })

    it('set', () => {
        expect(list.set(0, new Data(6 as const))[$$state]).toEqual([ new Data(6), new Data('ace')])
    })

})