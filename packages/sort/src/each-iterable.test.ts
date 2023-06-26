import { EachIterable } from './each-iterable'

import { describe, it, expect } from '@jest/globals'

////  ////

describe('iterate', () => {
    it('should return an empty iterator when called with no arguments', () => {
        const iterator = new EachIterable([])
        expect(iterator.next().done).toBe(true)
    })
  
    it('should return an iterator with the same number of items as the number of arguments', () => {
        const iterator = new EachIterable([[1, 2, 3]])
        expect(iterator.next().done).toBe(false)
        expect(iterator.next().done).toBe(false)
        expect(iterator.next().done).toBe(false)
        expect(iterator.next().done).toBe(true)
    })
  
    it('should iterate through any iterable arguments', () => {
        const arr = [1, 2, 3]
        const set = new Set([4, 5, 6])
        const map = new Map([[1, 'one'], [2, 'two'], [3, 'three']])
        const iterator = new EachIterable<unknown>([arr, set, map])
  
        expect(iterator.next().value).toBe(1)
        expect(iterator.next().value).toBe(2)
        expect(iterator.next().value).toBe(3)
        expect(iterator.next().value).toBe(4)
        expect(iterator.next().value).toBe(5)
        expect(iterator.next().value).toBe(6)
        expect(iterator.next().value).toEqual([1, 'one'])
        expect(iterator.next().value).toEqual([2, 'two'])
        expect(iterator.next().value).toEqual([3, 'three'])
        expect(iterator.next().done).toBe(true)
    })
  
    it('should return an iterator that can be used in a for-of loop', () => {
        const arr = [1, 2, 3]
        const set = new Set([4, 5, 6])
        const map = new Map([[1, 'one'], [2, 'two'], [3, 'three']])
        const iterator = new EachIterable<unknown>([arr, set, map])
  
        const expectedValues = [1, 2, 3, 4, 5, 6, [1, 'one'], [2, 'two'], [3, 'three']]
        const actualValues: unknown[] = []
        for (const value of iterator)  
            actualValues.push(value)
      
        expect(actualValues).toEqual(expectedValues)
    }) 
})

describe('map', () => {

    it('convenience method that sends each item through a mapping method', () => {
        const x2 = new EachIterable([[1,2,3], [4,5,6]]).map(x => x * 2)
        expect(x2).toEqual([2, 4, 6, 8, 10, 12])
    })

})

describe('filter', () => {

    it('convenience method that sends each item through a mapping method', () => {
        const x2 = new EachIterable([[1,2,3], [4,5,6]]).filter(x => x > 3)
        expect(x2).toEqual([4,5,6])
    })

})