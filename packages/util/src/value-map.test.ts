
import { ValuesMap } from './value-map'

/* eslint-disable 
    @typescript-eslint/no-this-alias,
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/prefer-readonly-parameter-types
*/

// Data

/* eslint-disable no-multi-spaces */
const pairs: [unknown, unknown][] = [
    [[0,0], `zero`],
    [[1,1], `one`],
    [[-1, -1], `minus-one`],
    [[Infinity, Number], `infinity`],
    [[-Infinity, Number], `minus-infinity`],
    [[`0`, `string`], `zero-string`],
    [[`1`, `string`], `one-string`],
    [[false, true, `100`, 100], `args-1`],
    [[true, false, 100, `100`], `args-2`],
]
/* eslint-enable no-multi-spaces */

// Helper

function forEachPair(func: (key: any, value: any) => void): void {
    for (const [key, value] of pairs)
        func(key, value)
}

// Tests

describe(`ValueMap`, () => {

    let map: ValuesMap<any, any>

    beforeEach(() => {
        map = new ValuesMap<any, any>(pairs)
    })

    describe(`Methods`, () => {

        describe(`.get()`, () => {
            describe(`gets key values`, () => {
                forEachPair((k, v) =>
                    it(`gets ${k.toString()}: ${String(v)}`, () => {
                        expect(map.get(k)).toEqual(v)
                    })
                )
            })
        })

        describe(`.set()`, () => {

            describe(`sets existing values`, () => {
                forEachPair((k) => {
                    it(`sets ${k.toString()} to true`, () => {
                        map.set(k, true)
                        return expect(map.get(k)).toBe(true)
                    })
                })
            })

            describe(`sets new values`, () => {
                it(`If key doesnt exists`, () => {
                    map.set(1000, `one-thousand`)
                    expect(map.get(1000)).toEqual(`one-thousand`)
                })
            })

        })

        describe(`.has()`, () => {

            describe(`returns true if map has key`, () => {
                forEachPair(k => {
                    it(`has key ${k.toString()} : true`, () => {
                        return expect(map.has(k)).toBe(true)
                    })
                })
            })

            describe(`returns false if not`, () => {
                [Symbol.iterator, `woooo`, -10231].forEach(k => {
                    it(`has key ${k.toString()} : false`, () => {
                        return expect(map.has(k)).toBe(false)
                    })
                })
            })

        })

        describe(`.delete()`, () => {

            describe(`removes item from map`, () => {
                forEachPair(k => {
                    it(`removes ${k.toString()}`, () => {
                        expect(map.delete(k)).toBe(true)
                        expect(map.has(k)).toBe(false) // eslint-disable-line no-unused-expressions
                    })
                })
            })

            describe(`returns false if no item was removed`, () => {
                it(`remove -1000 returns false`, () =>
                    expect(map.delete(-1000)).toBe(false)
                )
            })

        })

        describe(`.clear()`, () => {

            it(`removes all keys and values`, () => {
                map.clear()
                expect(map.size).toEqual(0)
                const keys = map[`_keys`]
                const values = map[`_values`]

                expect(keys).toHaveProperty(`length`, 0)
                expect(values).toHaveProperty(`length`, 0)
            })

        })

        describe(`.forEach()`, () => {

            it(`value and key come as first two arguments`, () => {
                map.forEach((v, k) => {
                    expect(map.has(k)).toEqual(true)
                    expect(map.get(k)).toEqual(v)
                })
            })

            it(`runs a function through each key value`, () => {
                let length = 0
                map.forEach(() => length++)
                expect(length).toEqual(map.size)
            })

            it(`map as third argument`, () => {
                map.forEach((_v, _k, m) =>
                    expect(m).toEqual(map)
                )
            })
        })

        describe(`.keys()`, () => {
            it(`returns an iterable for all keys`, () => {
                const keys = pairs.map(pair => pair[0])
                expect(keys).toEqual([...(map as any).keys()])
            })

        })

        describe(`.values()`, () => {
            it(`returns an iterable for all values`, () => {
                const values = pairs.map(pair => pair[1])
                expect(values).toEqual([...(map as any).values()])
            })
        })
    })

    describe(`Iterable`, () => {

        it(`for [key, value] of map`, () => {
            expect(() => {
                for (const _kv of map)// eslint-disable-line @typescript-eslint/no-unused-vars
                    break
            }).not.toThrow(Error)
        })

        it(`iterates through each key value`, () => {

            for (const [key, value] of map)
                expect(map.get(key)).toEqual(value)

            const kvs = [...map]
            expect(kvs.length).toEqual(map.size)
        })
    })

    describe(`Properties`, () => {
        describe(`@size`, () => {
            it(`returns number of keys`, () => {
                expect(map.size).toEqual(pairs.length)
            })
        })
    })
})
