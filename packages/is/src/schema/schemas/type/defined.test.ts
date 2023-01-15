import { isNil } from './nil'

import { test, expect } from '@jest/globals'
import { nil } from '@benzed/util'

//// Tests ////

test('isNil', () => {

    expect(isNil(NaN)).toBe(true)
    expect(isNil(null)).toBe(true)
    expect(isNil(undefined)).toBe(true)
    expect(isNil(1)).toBe(false)

    expect(isNil.validate(NaN)).toEqual(nil)
    expect(isNil.validate(null)).toEqual(nil)
    expect(isNil.validate(nil)).toEqual(nil)
    expect(() => isNil.validate(10)).toThrow('Must be nil')
})