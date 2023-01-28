import { isUnknown } from './unknown'

import { test, expect } from '@jest/globals'
import { nil } from '@benzed/util'

//// Tests ////

test('isUnknown', () => {
    expect(isUnknown(NaN)).toBe(true)
    expect(isUnknown(null)).toBe(true)
    expect(isUnknown(nil)).toBe(true)
    expect(isUnknown.validate(1)).toBe(1)
    expect(isUnknown(1)).toBe(true)

    expect(() => isUnknown.assert(1)).not.toThrow()
})
