import { isIterable } from './iterable'

import { it, expect } from '@jest/globals'

//// Tests ////
 
it('returns true if something is iterable', () => {
    expect(isIterable([])).toBe(true)
    expect(isIterable(new Map())).toBe(true)
    expect(isIterable.is(new Set())).toBe(true)

    expect(isIterable({
        *[Symbol.iterator]() {
            yield 1
        }
    })).toBe(true)
}) 

it('returns false if something is not iterable', () => {
    expect(isIterable(null)).toBe(false)
    expect(isIterable.is(4)).toBe(false)
})

it('validates iterables', () => {
    expect(isIterable.validate('')).toEqual('')
    expect(isIterable.validate([1,2,3,4])).toEqual([1,2,3,4])
    expect(() => isIterable.validate(1)).toThrow('ust be type iterable')
})

it('asserts iterables', () => {
    expect(() => isIterable.assert([])).not.toThrow()
    expect(() => isIterable.assert({})).toThrow('ust be type iterable') 
})
