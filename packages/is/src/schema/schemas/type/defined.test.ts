import { isDefined } from './defined'

import { test, expect } from '@jest/globals'
import { nil } from '@benzed/util'

//// Tests ////

test('isDefined', () => {

    expect(isDefined(NaN)).toBe(false)
    expect(isDefined(null)).toBe(false)
    expect(isDefined(undefined)).toBe(false)
    expect(isDefined(1)).toBe(true)

    expect(isDefined.validate(1)).toEqual(1)
    expect(isDefined.validate({})).toEqual({})
    expect(isDefined.validate(0)).toEqual(0)
    expect(() => isDefined.validate(nil)).toThrow('Must be defined')
})