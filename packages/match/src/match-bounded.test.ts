import is from '@benzed/is'

import { expectTypeOf } from 'expect-type'

import { Match, MatchBuilder, MatchBuilderEmpty, MatchBuilderIncomplete } from './types'
import { UnmatchedValueError } from './error'
import { match } from './match'

it('.match<type>() to created a bounded match', () => {

    const m = match<number>()
    expectTypeOf(m).toEqualTypeOf<MatchBuilderEmpty<number>>()
})

it('.match() to create an undefined bounded match', () => {

    const m = match()

    expectTypeOf(m).toEqualTypeOf<MatchBuilderEmpty<unknown>>()
})

it('.match<type>().case()', () => {

    const m = match<number>()
        .case(10, 'Ten')
        .case(1, 'One')

    expectTypeOf(m).toEqualTypeOf<MatchBuilder<number, 10 | 1, 'Ten' | 'One'>>()

    expect(m(10)).toEqual('Ten')
    expect(m(1)).toEqual('One')
    // @ts-expect-error No match for 0
    expect(() => m(0)).toThrow(UnmatchedValueError)
})

it('input types must match bounded type', () => {

    match<string>() 
        .case('ok', 'OK')
        // @ts-expect-error 100 is not a string
        .case(100, 'Not-Ok')

})

it('.match<type>().default()', () => {

    const m = match<number>()
        .case(1, 'One')
        .case(2, 'Two')
        .default('Any')

    expect(m(1)).toBe('One')
    expect(m(2)).toBe('Two')
    expect(m(3)).toBe('Any')
})

it('predicates', () => {

    const m = match<number>()
        .case(i => i > 0, '+')
        .case(i => i < 0, '-')

    expectTypeOf(m).toEqualTypeOf<MatchBuilder<number, number, '+' | '-'>>()

    const mc = m.default('~')

    expectTypeOf(mc).toEqualTypeOf<Match<number, '+' | '-' | '~'>>()

    expect(mc(0)).toEqual('~')
    expect(mc(1)).toEqual('+')
    expect(mc(-1)).toEqual('-')
})

it('type guards', () => {

    const m1 = match<number | string>()
        .case(is.string, i =>{ 
            expectTypeOf(i).toMatchTypeOf<string>()
            return `${i}!` as const
        })

    expectTypeOf(m1).toMatchTypeOf<MatchBuilderIncomplete<number | string, string, `${string}!`>>()

    const m2 = m1.case(is.number, i => {
        expectTypeOf(i).toMatchTypeOf<number>()
        return `${i}#` as const
    })

    expectTypeOf(m2).toMatchTypeOf<Match<number | string, `${string}!` | `${number}#`>>()

    expect(m2('Hey')).toEqual('Hey!')
    expect(m2(1)).toEqual('1#')
})

it('all cases must be handled', () => {

    const m = match<1 | 2>()
        .case(1, 'One')

    // @ts-expect-error Not all cases have been handled
    expect(m(1)).toEqual('One')

    const mc = m.case(2, 'Two')

    expect(mc(1)).toEqual('One')
    expect(mc(2)).toEqual('Two')

    // @ts-expect-error no case for 3
    expect(() => mc(3)).toThrow(UnmatchedValueError)
})

it('objects', () => {

    const m = match<{ foo: string }>() 
        .case({ foo: 'bar' }, 'Bar')
        .case({ foo: 'baz' }, 'Baz')
        .default('Dunno')

    expect(m({ foo: 'bar' })).toEqual('Bar')
    expect(m({ foo: 'baz' })).toEqual('Baz')
    expect(m({ foo: 'bor' })).toEqual('Dunno')

})