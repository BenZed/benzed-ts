import { isString } from '@benzed/is'
import pluck from './pluck'

import { expectTypeOf } from 'expect-type'

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

it('callback takes value, index, array args', () => {
    const arr = ['zero']

    pluck(arr, (v, i, a) => {
        expect(v).toEqual('zero')
        expect(i).toEqual(0)
        expect(a).toEqual(arr)
        return true
    })
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

it('optionally allows type guard predicates', () => {

    const arr = [0, 1, 2, 3, 'four', 'five', 'six']

    const strings = pluck(arr, isString)

    expectTypeOf(strings).toEqualTypeOf<string[]>()

})
