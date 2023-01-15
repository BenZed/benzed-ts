import { isNull } from './null'

import { test, expect } from '@jest/globals'

//// Tests ////

test('isValue', () => {
    expect(isNull(null)).toBe(true)
    expect(isNull(1)).toBe(false)
    expect(isNull.validate(null)).toEqual(null)
    expect(() => isNull.validate(10)).toThrow('Must be null')
})