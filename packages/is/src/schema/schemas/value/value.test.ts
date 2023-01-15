
import { IsValue } from './value'

import { expect } from '@jest/globals'

//// Tests ////

test('isValue', () => {
    const isZero = new IsValue(0)
    expect(isZero(0)).toBe(true)
    expect(isZero(1)).toBe(false)
    expect(isZero.validate(0)).toEqual(0)
    expect(() => isZero.validate(10)).toThrow('Must be 0')
})
