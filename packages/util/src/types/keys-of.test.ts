import { IndexesOf, indexesOf, KeysOf, keysOf, symbolsOf } from './keys-of'
import { expectTypeOf } from 'expect-type'
import { property } from '../property'

describe('keysOf', () => {

    const record = {
        a: 1,
        b: 2,
        c: 3
    }

    it('gets enumerable keys of', () => {
        expect([...keysOf(record)]).toEqual(['a', 'b', 'c'])
    })

    it('works on many objects', () => {
        expect([...keysOf({ foo: 'bar' }, { ace: true })])
            .toEqual(['foo', 'ace'])
    })

    it('equal keys are only iterated once', () => {
        expect([...keysOf({ foo: 'bar' }, { foo: 'cake' }, { ace: true })])
            .toEqual(['foo', 'ace'])
    })

    it('skips non-enumerable string keys', () => {
        const record2 = { ...record }
        property.value(record2, 'hidden', true)

        expect([...keysOf(record2)]).toEqual(['a', 'b' , 'c'])
    })

    it('keysOf.count', () => {
        expect(keysOf.count(record)).toEqual(3)
    })

    it('KeysOf', () => {
        type RecordKeys = KeysOf<typeof record>
        expectTypeOf<RecordKeys>().toEqualTypeOf<'a' | 'b' | 'c'>()
    })
})

describe('symbolsOf', () => {

    const $$case = Symbol('enumerable-symbol')

    const fancy = {
        ace: 'string',
        base: true,
        [$$case]: -100
    }
    
    it('gets symbolic keys', () => {
        expect([...symbolsOf(fancy)]).toEqual([$$case])
    })

    it('skips non-enumerable symbols', () => {
        const fancy1 = property.value({...fancy}, Symbol('non-enumerable-symbol'), true)
        expect([...symbolsOf(fancy1)]).toEqual([$$case])
    })

    it('skips duplicates', () => {
        expect([...symbolsOf(fancy, fancy)]).toEqual([$$case])
    })

    it('symbolsOf.count', () => {
        expect(symbolsOf.count(fancy)).toEqual(1)
    })

})

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