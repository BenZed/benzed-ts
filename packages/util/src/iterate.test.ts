import { iterate, isIterable } from './iterate'

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