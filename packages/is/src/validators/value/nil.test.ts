import { $nil } from './nil'

import { test, expect } from '@jest/globals'
import { nil } from '@benzed/util'

//// Tests ////

test('isNil', () => {
    expect($nil(NaN)).toEqual(nil)
    expect($nil(null)).toEqual(nil)
    expect($nil(nil)).toEqual(nil)
    expect(() => $nil(10))
        .toThrow('Must be nil')
}) 