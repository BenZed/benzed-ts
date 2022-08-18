import wrap from './wrap'

import { expectTypeOf } from 'expect-type'

it('ensures an input is an array', () => {

    expect(wrap(5)).toBeInstanceOf(Array)
    expect(wrap(5)).toEqual([5])
})

it('returns the input if it is an array', () => {
    const arr = [1]
    expect(wrap(arr)).toEqual(arr)
    expect(wrap(arr) === arr).toBe(true)
})

it('return type is array of input type', () => {
    expectTypeOf(wrap(true)).toEqualTypeOf<boolean[]>()
    expectTypeOf(wrap('string')).toEqualTypeOf<string[]>()
    expectTypeOf(wrap(5)).toEqualTypeOf<number[]>()
})

it('return type retains readonly modifier', () => {
    const readonlyArr: readonly string[] = ['a']
    expectTypeOf(wrap(readonlyArr)).toEqualTypeOf<readonly string[]>()
})

it('return type retains const modifier', () => {
    const constArr = ['a'] as const
    expectTypeOf(wrap(constArr)).toEqualTypeOf<readonly ['a']>()
})