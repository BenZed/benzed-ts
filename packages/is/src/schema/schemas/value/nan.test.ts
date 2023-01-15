import { isNaN } from './nan'

import { test, expect } from '@jest/globals'

//// Tests ////

test('isValue', () => {
    expect(isNaN(NaN)).toBe(true)
    expect(isNaN(1)).toBe(false)
    expect(isNaN.validate(NaN)).toEqual(NaN)
    expect(() => isNaN.validate(10)).toThrow('Must be NaN')
})