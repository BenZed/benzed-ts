import { iterate } from './iterator'

describe('iterate function', () => {
    it('should return an empty iterator when called with no arguments', () => {
        const iterator = iterate()
        expect(iterator.next().done).toBe(true)
    })
  
    it('should return an iterator with the same number of items as the number of arguments', () => {
        const iterator = iterate(1, 2, 3)
        expect(iterator.next().done).toBe(false)
        expect(iterator.next().done).toBe(false)
        expect(iterator.next().done).toBe(false)
        expect(iterator.next().done).toBe(true)
    })
  
    it('should iterate through any iterable arguments', () => {
        const arr = [1, 2, 3]
        const set = new Set([4, 5, 6])
        const map = new Map([[1, 'one'], [2, 'two'], [3, 'three']])
        const iterator = iterate(...arr, set, ...map)
  
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
        const iterator = iterate(...arr, set, ...map)
  
        const expectedValues = [1, 2, 3, 4, 5, 6, [1, 'one'], [2, 'two'], [3, 'three']]
        const actualValues = []
        for (const value of iterator) 
            actualValues.push(value)
      
        expect(actualValues).toEqual(expectedValues)
    })
})
  