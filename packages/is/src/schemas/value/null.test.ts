import { $null as isNull } from './null'

import { test, expect } from '@jest/globals'

//// Tests ////

test('isValue', () => {
    expect(isNull(null)).toBe(null)
    expect(() => isNull(10)).toThrow('Must be null')
}) 