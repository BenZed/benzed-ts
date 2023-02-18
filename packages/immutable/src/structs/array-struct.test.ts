import { ArrayStruct } from './array-struct'

import { test, expect } from '@jest/globals'
import { getState, State } from '../state'
import { expectTypeOf } from 'expect-type'
import equals from '../traits/comparable/equals'

//// Setup ////

const data = [1,2,3,4,5]

const array = new ArrayStruct(...data)

//// Tests ////

test('get State', () => {
    expect(getState(array)).toEqual({
        0: 1,
        1: 2,
        2: 3,
        3: 4,
        4: 5
    })

    expect(getState(array)).toEqual({ ...array })
})

test('state type', () => {
    type ArrayState = State<typeof array>
    expectTypeOf<ArrayState>()
        .toEqualTypeOf<ArrayState>()
})

test('iterable', () => {
    expect([...array]).toEqual(data)
})

describe('array interface', () => {

    test('length', () => {
        expect(array.length).toBe(data.length)
    })

    test('at', () => {
        expect(array.at(0)).toEqual(data.at(0))
        expect(array.at(-1)).toEqual(data.at(-1))
        expect(array.at(data.length)).toEqual(data.at(data.length))
    })

    test('push', () => {
        const arrayPlus1 = array.push(6)
        expect(getState(arrayPlus1)).toEqual({
            0: 1,
            1: 2,
            2: 3,
            3: 4,
            4: 5,
            5: 6
        })

        expect(arrayPlus1).not.toBe(array)
        expect(arrayPlus1).toHaveLength(6)
    })

    test('pop', () => {
        const arrayMinus1 = array.pop()
        expect(getState(arrayMinus1)).toEqual({
            0: 1,
            1: 2,
            2: 3,
            3: 4,
        })

        expect(arrayMinus1).not.toBe(array)
        expect(arrayMinus1).toHaveLength(4)
    })

    test('shift', () => {
        const arrayMinus1 = array.shift()
        expect(getState(arrayMinus1)).toEqual({
            0: 2,
            1: 3,
            2: 4,
            3: 5,
        })

        expect(arrayMinus1).not.toBe(array)
        expect(arrayMinus1).toHaveLength(4)
    })

    test('sort', () => {
        const arraySorted = array
            .shift()
            .push(array[0])
            .sort()

        expect(equals(array, arraySorted)).toBe(true)
        expect(array).not.toBe(arraySorted)
    })

    test('reverse', () => {
        const arrayReversed = array.reverse()
        expect(getState(arrayReversed)).toEqual({
            0: 5,
            1: 4,
            2: 3,
            3: 2,
            4: 1,
        })
        expect(array).not.toBe(arrayReversed)
    })

    test('splice', () => {
        const arraySpliced = array.splice(1, 1)
        expect(getState(arraySpliced)).toEqual({
            0: 1,
            1: 3,
            2: 4,
            3: 5,
        })
        expect(array).not.toBe(arraySpliced)
    })

    test('slice', () => {
        const arraySliced = array.slice(1, 3)
        expect(getState(arraySliced)).toEqual({
            0: 2,
            1: 3
        }) 
        expect(array).not.toBe(arraySliced)
    })

    test('map', () => {
        const arrayMapped = array.map(i => i * 2)
        expect(getState(arrayMapped)).toEqual({
            0: 2,
            1: 4,
            2: 6,
            3: 8,
            4: 10,
        }) 
        expect(array).not.toBe(arrayMapped)
    })

    test('filter', () => {
        const arrayFiltered = array.filter(i => i < 2)
        expect(getState(arrayFiltered)).toEqual({
            0: 1
        }) 
        expect(array).not.toBe(arrayFiltered)
    })

    test('filter', () => {
        const arrayFiltered = array.filter(i => i < 2)
        expect(getState(arrayFiltered)).toEqual({
            0: 1
        }) 
        expect(array).not.toBe(arrayFiltered)
    })

})