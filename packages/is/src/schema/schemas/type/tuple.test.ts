import { Tuple } from './tuple'

import { test } from '@jest/globals'

import { isNumber } from './numeric'

//// Setup ////

const range = new Tuple(isNumber, isNumber)

//// Tests ////

test('validates tuples', () => {
    expect(range.validate([0,1])).toEqual([0,1])
})

test('casts from json str', () => {
    expect(range.validate('[0,1]')).toEqual([0,1])
})

test('respects nested validation', () => {
    const edge = new Tuple(
        isNumber.range('<', 0),
        isNumber.range('>=', 0)
    )
    expect(edge([0,0])).toBe(false)
    expect(edge([-1,1])).toBe(true)
    expect(() => edge.validate([0,0])).toThrow('ust be below 0')
})
