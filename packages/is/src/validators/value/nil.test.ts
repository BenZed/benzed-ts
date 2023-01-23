import { isNil } from './nil'

import { test, expect } from '@jest/globals'
import { nil } from '@benzed/util'

//// Tests ////

test('isNil', () => {
    expect(isNil(NaN)).toEqual(nil)
    expect(isNil(null)).toEqual(nil)
    expect(isNil(nil)).toEqual(nil)
    expect(() => isNil(10))
        .toThrow('Must be nil')
})