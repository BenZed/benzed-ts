import first from './first'
import { expectTypeOf } from 'expect-type'

/*** Tests ***/

it(`returns the first element of an array`, () => {
    expect(first([1, 2, 3, 4, 5]))
        .toEqual(1)
})

it(`works on strings`, () => {
    expect(first(`string`))
        .toEqual(`s`)
})

it(`works on other array likes`, () => {
    expect(
        first({
            0: `zero`,
            length: 1
        })
    ).toEqual(`zero`)
})

it(`return type for arrays is typeof array or undefined`, () => {
    expectTypeOf(first([5]))
        .toEqualTypeOf<number | undefined>()
})

it(`return type for string is string`, () => {
    expectTypeOf(first(`cake`))
        .toEqualTypeOf<string>()
})

it(`return type for array likes`, () => {
    expectTypeOf(first({ 0: `zero`, length: 1 }))
        .toEqualTypeOf<string | undefined>()
})

it(`return type for readonly arrays is array type`, () => {
    expectTypeOf(
        first([`a`] as readonly string[])
    ).toEqualTypeOf<string>()
})

it(`return type for const arrays is const item`, () => {
    expectTypeOf(
        first([1, 2, 3] as const)
    ).toEqualTypeOf<1>()
})