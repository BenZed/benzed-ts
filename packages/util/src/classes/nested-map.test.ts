import { isArray, isNumber, isRecord, nil } from '../types'
import { NestedMap } from './nested-map'

////  ////

const ref = new NestedMap<number[], object>()

const kv = [
    { key: [], value: { v: 'A' } },
    { key: [0], value: { v: 'B0' } },
    { key: [1], value: { v: 'B1' } },
    { key: [0, 0], value: { v: 'C0' } },
    { key: [0, 1], value: { v: 'C1' } },
    { key: [0, 0, 0], value: { v: 'D0' } },
    { key: [0, 0, 1], value: { v: 'D1' } },
    { key: [0, 0, 0, 0], value: { v: 'E0' } },
    { key: [0, 0, 0, 1], value: { v: 'E1' } },
] as const

//// Tests ////

for (const { key, value } of kv) {

    const _r = ref.set([...key], value)
    it(`set ${key}`, () => {
        expect(_r).toEqual(ref)
    })

    it(`get ${key}`, () => {
        expect(ref.get([...key])).toBe(value)
        expect(ref.get([...key, 10])).toBe(nil)
    })

    it(`has ${key}`, () => {
        expect(ref.has([...key])).toBe(true)
        expect(ref.has([...key, 10])).toBe(false)
    })

}

it('keys', () => {
    expect(Array.from(ref.keys())).toHaveLength(ref.size)
    expect(Array.from(ref.keys()).every(k => isArray(k, isNumber))).toBe(true)
})

it('values', () => {
    expect(Array.from(ref.values())).toHaveLength(ref.size)
    expect(Array.from(ref.values()).every(isRecord)).toBe(true)
})

it('entries', () => {
    expect(Array.from(ref.entries())).toHaveLength(ref.size)
    expect(Array.from(ref)).toHaveLength(ref.size)
})

it('forEach', () => {
    
    const ks: unknown[] = []
    const vs: unknown[] = [] 
    ref.forEach((k, v) => {
        ks.push(k)
        vs.push(v)
    })
    expect(ks).toHaveLength(ref.size)
    expect(vs).toHaveLength(ref.size)
})

it('size', () => {
    expect(ref.size).toEqual(kv.length) 
}) 

it('clear', () => {
    const ref = new NestedMap()
    kv.forEach(({ key, value }) => {
        ref.set([...key], value)
    })

    ref.clear()
    expect(ref.size).toBe(0)

})

it('delete', () => {

    const ref = new NestedMap()
    ref.set([], 0)

    expect(ref.delete([])).toEqual(true)
    expect(ref.delete([1])).toEqual(false) 
})