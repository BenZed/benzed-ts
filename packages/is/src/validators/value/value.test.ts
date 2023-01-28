
import { Value } from './value'

import { expect } from '@jest/globals'

//// Tests ////

test('isValue', () => {
    const $zero = new Value(0)
    expect($zero(0)).toEqual(0)
    expect(() => $zero(10)).toThrow('Must be 0')
})