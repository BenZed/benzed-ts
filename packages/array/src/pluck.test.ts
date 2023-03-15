import { isString } from '@benzed/util'
import { pluck } from './pluck'

import { expectTypeOf } from 'expect-type'
import { it, expect, describe, test, beforeAll } from '@jest/globals'

const arr = [1, 2, 3, 4, 5, 6, 7, 8]
let even: number[]

beforeAll(() => {
    even = pluck(arr, n => n % 2 === 0)
})

it('removes results from an array that pass a test', () => {
    expect(arr).toEqual([1, 3, 5, 7])
})

it('returns results to new array', () => {
    expect(even).toEqual([2, 4, 6, 8])
})

it.skip('predicate takes value, index, array args', () => {
    // const arr = ['zero']

    // pluck(arr, (v,i,a) => {
    //     expect(v).toEqual('zero')
    //     expect(i).toEqual(0)
    //     expect(a).toEqual(arr)
    //     expectTypeOf(v).toEqualTypeOf<string>()
    //     expectTypeOf(i).toEqualTypeOf<number>()
    //     expectTypeOf(a).toEqualTypeOf<ArrayLike<string>>()
    //     return true
    // })
})

describe('count', () => {

    it('limits the number of results to take', () => {

        const arr = ['one', 'two', 'three', 'four']

        const firstShort = pluck(arr, word => word.length <= 3, 1)

        expect(arr).toHaveLength(3)
        expect(arr).toEqual(['two', 'three', 'four'])
        expect(firstShort).toEqual(['one'])

    })

    it('negative numbers take last results', () => {

        const arr = [11, 2, 3, 4, 5, 6, 7, 8, 19, 10]

        const lastTwoDoubleDigits = pluck(arr, n => n >= 10, -2)

        expect(arr).toEqual([11, 2, 3, 4, 5, 6, 7, 8])
        expect(lastTwoDoubleDigits).toEqual([19, 10])
    })
})

describe('typeguard filter', () => {

    test('arrays/array-likes', () => {

        const arr = [0, 1, 2, 3, 'four', 'five', 'six']
    
        const strings = pluck(arr, isString)
        expectTypeOf(strings).toEqualTypeOf<string[]>()
    
    })
    
    it.skip('read-only arrays', () => {
    
        // const arr = [{ foo: 'string' }, { foo: 'bar' }, { bar: 0 }] as const

        // const isFoo = (i: unknown): i is { foo: string } => 
        //     isRecordOf(isString)(i)

        // const foos = pluck(arr, isFoo)
        // expect(foos).toHaveLength(2)
        // expectTypeOf(foos).toMatchTypeOf<{ foo: string }[]>()
    })

})