import { $nan } from './nan'

import { test, expect } from '@jest/globals'

//// Tests ////

test('isValue', () => {
    expect($nan(NaN)).toEqual(NaN)
    expect(() => $nan(10)).toThrow('Must be NaN')
})