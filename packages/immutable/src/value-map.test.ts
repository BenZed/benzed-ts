import copy from './copy'
import equals from './equals'

import ValueMap from './value-map'

import { $$copy, $$equals } from './util'

/* eslint-disable 
    @typescript-eslint/no-this-alias,
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/prefer-readonly-parameter-types
*/

/*** Types ***/

class CustomId {

    public id = 0

    public constructor(input = Math.random()) {

        this.id = input
        while (this.toString().length < 10)
            this.id += Math.random() * 0.1

        while (this.id > 1)
            this.id *= 0.1
    }

    public [$$equals](b: unknown): boolean {
        return typeof b === 'object' &&
            b !== null &&
            'id' in b &&
            (b as CustomId).id === this.id
    }

    public toString(): string {
        return this.id.toString().replace('0.', '#')
    }

}

/******************************************************************************/
// Data
/******************************************************************************/

/* eslint-disable no-multi-spaces */
const pairs: [unknown, unknown][] = [
    [0, 'zero'],
    [1, 'one'],
    [-1, 'minus-one'],
    [Infinity, 'infinity'],
    [-Infinity, 'minus-infinity'],
    ['0', 'zero-string'],
    ['1', 'one-string'],
    [Symbol('id-1'), 'symbol-1'],
    [Symbol('id-2'), 'symbol-2'],
    [new CustomId(), 'custom-id-1'],
    [new CustomId(), 'custom-id-2']
]
/* eslint-enable no-multi-spaces */

/******************************************************************************/
// Helper
/******************************************************************************/

function forEachPair(func): void {
    for (const [key, value] of pairs)
        func(key, value)
}

/******************************************************************************/
// Tests
/******************************************************************************/

describe('ValueMap', () => {

    let map: ValueMap<any, any>

    beforeEach(() => {
        map = new ValueMap<any, any>(pairs)
    })

    describe('initializes with key-value pairs paremeters', () => {

        it('Constructed values are added to data', () => {
            const map = new ValueMap<string | number, number>([
                ['1', 1000],
                ['2', 2000],
                ['3', 3000],
                [1, 4000],
                [2, 5000],
                [3, 6000],
                ['oy-wtf-mate', 7000]
            ])

            const values = map['_values']

            expect(values).toHaveProperty('length', map.size)
        })

    })

    describe('Valid ids', () => {

        describe('Strings', () => {
            it('any', () => {
                expect(() => new ValueMap([
                    ['any ol string', true]
                ])).not.toThrow()
            })
        })

        describe('Symbols', () => {
            it('any', () => {
                expect(() => new ValueMap([
                    [Symbol('symbols'), true]
                ])).not.toThrow()
            })
        })

        describe('Custom Ids', () => {
            it('any', () => {
                expect(() => new ValueMap([
                    [new CustomId(), true]
                ])).not.toThrow()
            })
        })

        describe('Numbers', () => {

            it('finite numbers pass', () => {
                expect(() => new ValueMap([
                    [504129.11, true]
                ])).not.toThrow()
            })

            it('infinite numbers pass', () => {
                expect(() => new ValueMap([
                    [Infinity, true]
                ])).not.toThrow()

                expect(() => new ValueMap([
                    [-Infinity, true]
                ])).not.toThrow()
            })

            it('NaN passes', () => {
                expect(() => new ValueMap([
                    [NaN, true]
                ])).not.toThrow()
            })
        })
    })

    describe('Methods', () => {

        describe('.get()', () => {

            describe('gets key values', () => {
                forEachPair((k, v) =>
                    it(`gets ${k.toString()}: ${String(v)}`, () => {
                        expect(map.get(k)).toEqual(v)
                    })
                )
            })

            describe('equivalent object ids pass', () => {
                forEachPair((k, v) => {
                    if (typeof k !== 'object')
                        return
                    it(`gets copy of ${k.toString()}: ${v}`, () => {
                        const ki = new k.constructor(k.id)
                        expect(map.get(ki)).toEqual(v)
                    })
                })
            })

        })

        describe('.set()', () => {

            describe('sets existing values', () => {
                forEachPair((k) => {
                    it(`sets ${k.toString()} to true`, () => {
                        map.set(k, true)
                        return expect(map.get(k)).toBe(true)
                    })
                })
            })

            describe('equivalent object ids pass', () => {

                let size
                beforeAll(() => {
                    size = map.size
                })

                forEachPair(k => {
                    if (typeof k !== 'object')
                        return
                    it(`sets copy of ${k.toString()} to false`, () => {
                        const ki = new k.constructor(k.id)
                        map.set(ki, false)

                        // Proves that setting a key copy didn't result in a new key being set
                        expect(map.size).toEqual(size)

                        return expect(map.get(ki)).toBe(false)
                    })
                })
            })

            describe('sets new values', () => {
                it('If key doesnt exists', () => {
                    map.set(1000, 'one-thousand')
                    expect(map.get(1000)).toEqual('one-thousand')
                })
            })

        })

        describe('.has()', () => {

            describe('returns true if map has key', () => {
                forEachPair(k => {
                    it(`has key ${k.toString()} : true`, () => {
                        return expect(map.has(k)).toBe(true)
                    })
                })
            })

            describe('returns false if not', () => {
                [Symbol.iterator, 'woooo', -10231].forEach(k => {
                    it(`has key ${k.toString()} : false`, () => {
                        return expect(map.has(k)).toBe(false)
                    })
                })
            })

            describe('equivalent object ids work', () => {
                forEachPair(k => {
                    if (typeof k !== 'object')
                        return
                    it(`sets copy of ${k.toString()} to false`, () => {
                        const ki = new k.constructor(k.id)
                        map.set(ki, false)
                        return expect(map.has(ki)).toBe(true)
                    })
                })
            })
        })

        describe('.delete()', () => {

            describe('removes item from map', () => {
                forEachPair(k => {
                    it(`removes ${k.toString()}`, () => {
                        expect(map.delete(k)).toBe(true)
                        expect(map.has(k)).toBe(false) // eslint-disable-line no-unused-expressions
                    })
                })
            })

            describe('returns false if no item was removed', () => {
                it('remove -1000 returns false', () =>
                    expect(map.delete(-1000)).toBe(false)
                )
            })

            describe('equivalent object ids work', () => {
                forEachPair(k => {
                    if (typeof k !== 'object')
                        return
                    it(`sets copy of ${k.toString()} to false`, () => {
                        const ki = new k.constructor(k.id)
                        return expect(map.delete(ki)).toBe(true)
                    })
                })
            })
        })

        describe('.clear()', () => {

            it('removes all keys and values', () => {
                map.clear()
                expect(map.size).toEqual(0)
                const keys = map['_keys']
                const values = map['_values']

                expect(keys).toHaveProperty('length', 0)
                expect(values).toHaveProperty('length', 0)
            })

        })

        describe('.forEach()', () => {

            it('value and key come as first two arguments', () => {
                map.forEach((v, k) => {
                    expect(map.has(k)).toEqual(true)
                    expect(map.get(k)).toEqual(v)
                })
            })

            it('runs a function through each key value', () => {
                let length = 0
                map.forEach(() => length++)
                expect(length).toEqual(map.size)
            })

            it('map as third argument', () => {
                map.forEach((_v, _k, m) =>
                    expect(m).toEqual(map)
                )
            })
        })

        describe('.keys()', () => {
            it('returns an iterable for all keys', () => {
                const keys = pairs.map(pair => pair[0])
                expect(keys).toEqual([...(map as any).keys()])
            })

        })

        describe('.values()', () => {
            it('returns an iterable for all values', () => {
                const values = pairs.map(pair => pair[1])
                expect(values).toEqual([...(map as any).values()])
            })
        })
    })

    describe('Iterable', () => {

        it('for [key, value] of map', () => {
            expect(() => {
                for (const _kv of map)// eslint-disable-line @typescript-eslint/no-unused-vars
                    break
            }).not.toThrow(Error)
        })

        it('iterates through each key value', () => {

            for (const [key, value] of map)
                expect(map.get(key)).toEqual(value)

            const kvs = [...map]
            expect(kvs.length).toEqual(map.size)
        })
    })

    describe('Properties', () => {
        describe('@size', () => {
            it('returns number of keys', () => {
                expect(map.size).toEqual(pairs.length)
            })
        })
    })

    describe('immutable implementations', () => {

        let map1, map2

        beforeAll(() => {
            map1 = new ValueMap([['one', 1]])
            map2 = copy(map1)
        })

        it('implements $$copy', () => {
            expect(typeof map1[$$copy]).toEqual('function')
            expect(map2).toBeInstanceOf(ValueMap)
            expect(map1.size).toEqual(map2.size)

            for (const [key, value] of map1)
                expect(map2.get(key)).toEqual(value)
        })

        it('implements $$equals', () => {
            expect(typeof map1[$$equals]).toEqual('function')

            const map3 = new ValueMap()

            expect(equals(map1, map2)).toEqual(true)
            expect(equals(map2, map1)).toEqual(true)
            expect(equals(map3, map1)).toEqual(false)
        })
    })
})
