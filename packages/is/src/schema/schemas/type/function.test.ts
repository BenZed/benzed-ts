import { isFunction as isFunction } from './function'

import { test, expect } from '@jest/globals'

//// Tests ////

test(`${isFunction.name}`, () => {
    expect(isFunction({})).toBe(false)
    expect(isFunction(parseInt)).toBe(true)
    expect(isFunction(1)).toBe(false)
    expect(isFunction(Symbol.iterator)).toBe(false)
    expect(isFunction.validate(parseInt)).toEqual(parseInt)
    expect(() => isFunction.validate(10)).toThrow('must be a function')
})
