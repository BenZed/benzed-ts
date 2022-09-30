import last from './last'
import { expectTypeOf } from 'expect-type'

it('returns the last element of an array', () => {
    expect(last([1, 2, 3, 4, 5])).toEqual(5)
})

it('works on array-likes', () => {
    expect(last('string')).toEqual('g')
    expect(last({ 0: 'zero', 1: 'one', length: 2 })).toEqual('one')
})

it('return type for arrays is typeof array or undefined', () => {
    expectTypeOf(last([5]))
        .toEqualTypeOf<number | undefined>()
})

it('return type for string is string', () => {
    expectTypeOf(last('cake'))
        .toEqualTypeOf<string>()
})

it('return type for array likes', () => {
    expectTypeOf(last({ 0: 'zero', length: 1 }))
        .toEqualTypeOf<string | undefined>()
})

it('return type for readonly arrays is array type', () => {
    expectTypeOf(
        last(['a', 'b'] as readonly string[])
    ).toEqualTypeOf<string>()
})

it('return type for const arrays is const item', () => {
    expectTypeOf(
        last([1, 2, 3] as const)
    ).toEqualTypeOf<3>()
})