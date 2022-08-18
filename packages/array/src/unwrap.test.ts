import { expectTypeOf } from 'expect-type'
import unwrap from './unwrap'

it('ensures an input is not an array', () => {
    const obj = {}

    expect(unwrap([obj])).toEqual(obj)
})

it('returns the input if it is not an array', () => {

    const obj = {}

    expect(unwrap(obj)).toEqual(obj)
})

it('return type for non arrays is same as input', () => {
    expectTypeOf(unwrap(true)).toEqualTypeOf<boolean>()
})

it('return type for arrays is typeof array or undefined', () => {
    expectTypeOf(unwrap([5])).toEqualTypeOf<number | undefined>()
})

it('return type for readonly arrays is array type', () => {
    const readonlyArr: readonly string[] = ['a']
    const result = unwrap(readonlyArr)
    expectTypeOf(result).toEqualTypeOf<string>()
})

it('return type for const arrays is const item', () => {
    const readonlyArr = [1, 2, 3] as const
    const result = unwrap(readonlyArr)
    expectTypeOf(result).toEqualTypeOf<1>()
})