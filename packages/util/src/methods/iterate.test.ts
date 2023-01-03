import { iterate } from './iterate'
import { isIterable } from '../types'

describe('isIterable()', () => {

    it('returns true if object is iterable', () => {

        for (const iterable of [
            [],
            new Set(),
            new Map(),
            {
                *[Symbol.iterator](): Generator<unknown> {
                    yield iterate(this)
                }
            },
            'string'
        ])
            expect(isIterable(iterable)).toBe(true)

    })

    it('returns false if object is not iterable', () => {

        for (const notIterable of [
            null,
            undefined,
            0,
            false,
            true,
            {},
            Symbol()
        ])
            expect(isIterable(notIterable)).toBe(false)
    })

})

describe('iterate()', () => {

    it('iterates through arraylikes', () => {
        const arr = { length: 5 }
        expect([...iterate(arr)]).toEqual(Array.from(arr))
    })

    it('iterates through iterables', () => {
        expect([...iterate(new Set([1, 2, 3, 4]))])
            .toEqual([1, 2, 3, 4])
    })

    it('iterates through objects', () => {

        const foo = { 'a': 1, 'b': 2, 'c': 3 }

        expect([...iterate(foo)]).toEqual([1, 2, 3])
    })

    it('iterates through strings', () => {
        const str = 'foo'

        expect([...iterate(str)]).toEqual(['f', 'o', 'o'])
    })
  
})

describe('with each function', () => {
    it('maps', () => {
        const output = iterate(iterate(1, [2], [3,4,5]), n => n * 2)
        expect(output).toEqual([2, 4, 6, 8, 10])
    })

    it('async', async () => {
        const orderResolved: number[] = []

        const output = iterate(
            [25,75,50,0], 
            n => new Promise<void>(r => setTimeout(() => {
                orderResolved.push(n)
                r()
            }, n)) 
        )

        expect(output).toBeInstanceOf(Promise)
        await output
    
        expect(orderResolved).toEqual([25,75,50,0])
    })

})