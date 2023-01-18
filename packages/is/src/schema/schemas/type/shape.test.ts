import { Shape } from './shape'

import { test } from '@jest/globals'

import { isNumber } from './numeric'

import { expectTypeOf } from 'expect-type'

//// Setup ////

const isVector = new Shape({
    x: isNumber,
    y: isNumber
})

//// Tests ////

test('validates shapes', () => {
    const valid = isVector.validate({ x: 0, y: 1 }) 
    expectTypeOf(valid).toEqualTypeOf<{ x: number, y: number }>()

    expect(isVector({ x: 0, y: 0 })).toBe(true)
    expect(isVector({ x: '9', y: '9'})).not.toBe(true)
})