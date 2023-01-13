import { isObject } from './is-object'

import { test, expect } from '@jest/globals'

//// Tests ////

test(`${isObject.name}`, () => {
    expect(isObject({})).toBe(true)
    expect(isObject(parseInt)).toBe(true)
    expect(isObject(1)).toBe(false)
    expect(isObject(Symbol.iterator)).toBe(false)
    expect(isObject.validate({})).toEqual({})
    expect(() => isObject.validate(10)).toThrow('must be an object')
})
