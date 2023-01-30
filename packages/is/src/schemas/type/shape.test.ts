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
})