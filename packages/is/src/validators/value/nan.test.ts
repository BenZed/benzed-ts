import { isNaN } from './nan'

import { test, expect } from '@jest/globals'

//// Tests ////

test('isValue', () => {
    expect(isNaN(NaN)).toEqual(NaN)
    expect(() => isNaN(10)).toThrow('Must be NaN')
})