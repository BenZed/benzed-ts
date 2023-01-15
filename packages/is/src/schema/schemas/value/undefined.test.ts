import { isUndefined } from './undefined'

import { test, expect } from '@jest/globals'

//// Tests ////

test('isValue', () => {
    expect(isUndefined(undefined)).toBe(true)
    expect(isUndefined(1)).toBe(false)
    expect(isUndefined.validate(undefined)).toEqual(undefined)
    expect(() => isUndefined.validate(10)).toThrow('Must be undefined')
})