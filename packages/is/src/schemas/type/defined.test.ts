import { $defined } from './defined'

import { test, expect } from '@jest/globals'
import { nil } from '@benzed/util'

//// Tests ////

test('defined', () => {

    expect($defined(1)).toEqual(1)
    expect($defined({})).toEqual({})
    expect($defined(0)).toEqual(0)
    expect(() => $defined(nil)).toThrow('Must be defined')
})  