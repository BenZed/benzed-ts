import { eachIndex as indexesOf, IndexesOf } from './index-generator'
import { expectTypeOf } from 'expect-type'

describe('indexesOf', () => {

    const arr = ['a','b','c', 'd', 'e', 'f'] as const 
    const arrLike = {
        0: 'a',
        1: 'b',
        2: 'c',
        3: 'd',
        4: 'e',
        5: 'f',
        length: 6
    } as const

    it('iterates indexes', () => {
        expect([...indexesOf(arr)]).toEqual([0,1,2,3,4,5])
    })

    it('iterates indexes on arrayLikes', () => {
        expect([...indexesOf(arrLike)]).toEqual([0,1,2,3,4,5])
    })

    it('IndexesOf type', () => {

        type I1 = IndexesOf<number[]>
        expectTypeOf<I1>().toEqualTypeOf<number>()

        type I2 = IndexesOf<['a', 'b', 'c']>
        expectTypeOf<I2>().toEqualTypeOf<0 | 1 | 2>()

        type I3 = IndexesOf<{ foo: string }>
        expectTypeOf<I3>().toEqualTypeOf<never>()

    })

    describe('options', () => {

        it('start', () => {
            expect([...indexesOf(arr, 1)]).toEqual([1,2,3,4,5])
        })

        it('start must be an integer', () => {
            expect(() => [...indexesOf(arr, 1.5)])
                .toThrow('must be a positive integer')
        })

        it('start must be positive', () => {
            expect(() => [...indexesOf(arr, -1)])
                .toThrow('must be a positive integer')
        })

        it('end', () => {
            expect([...indexesOf(arr, 0, 4)]).toEqual([0,1,2,3,4])
        })

        it('end negative', () => {
            expect([...indexesOf(arr, 0, -1)]).toEqual([0,1,2,3,4,5])
            expect([...indexesOf(arr, 0, -2)]).toEqual([0,1,2,3,4])
        })

        it('end must be an integer', () => {
            expect(() => [...indexesOf(arr, 0, 1.5)])
                .toThrow('must resolve to an integer')
        })
        
        it('step', () => {
            expect([...indexesOf(arr, 0, -1, 2)]).toEqual([0,2,4])
        })

        it('step must be integer', () => {
            expect(() => [...indexesOf(arr, 0, -1, 2.5)])
                .toThrow('must be a positive integer')
        })

        it('step must be positive', () => {
            expect(() => [...indexesOf(arr, 0, -1, -1)])
                .toThrow('must be a positive integer')
        })

        it('reverse', () => {
            expect([...indexesOf(arr, true)]).toEqual([5,4,3,2,1,0])
        })

        it('as object', () => {
            expect([...indexesOf(arr, { reverse: true, start: 1, end: -2, step: 2 })])
                .toEqual([4,2])
        })
    })
})