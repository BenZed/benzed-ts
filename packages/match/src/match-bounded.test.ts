import is from '@benzed/is'

import { expectTypeOf } from 'expect-type'

import { Match, MatchBoundedBuilder, MatchBoundedBuilderEmpty } from './types'
import { UnmatchedValueError } from './error'
import { match } from './match'

it('.match<type>() to created a bounded match', () => {

    const m = match<number>()
    expectTypeOf(m).toEqualTypeOf<MatchBoundedBuilderEmpty<number>>()
})

it('.match() to create an undefined bounded match', () => {

    const m = match()

    expectTypeOf(m).toEqualTypeOf<MatchBoundedBuilderEmpty<undefined>>()
})

it('.match(typeGuard) to create a bounded guarded match', () => {

    const m = match(is.number)

    expectTypeOf(m).toEqualTypeOf<MatchBoundedBuilderEmpty<number>>()

})

it('.match<type>().case()', () => {

    const m = match<number>()
        .case(10, 'Ten')
        .case(1, 'One')

    expectTypeOf(m).toEqualTypeOf<MatchBoundedBuilder<number, 'Ten' | 'One'>>()

    expect(m(10)).toEqual('Ten')
    expect(m(1)).toEqual('One')
    expect(() => m(0)).toThrow(UnmatchedValueError)
})

it('input types must match bounded type', () => {

    match<string>() 
        .case('ok', 'OK')
        // @ts-expect-error 100 is a number
        .case(100, 'Not-Ok')

})

it('.match<type>().default()', () => {

    const m = match(is.number)
        .case(1, 'One')
        .case(2, 'Two')
        .default('Any')

    expect(m(1)).toBe('One')
    expect(m(2)).toBe('Two')
    expect(m(3)).toBe('Any')
})

it('predicates', () => {

    const m = match(is.number)
        .case(i => i > 0, '+')
        .case(i => i < 0, '-')
        .default('~')

    expectTypeOf(m).toEqualTypeOf<Match<number, '+' | '-' | '~'>>()

    expect(m(0)).toEqual('~')
    expect(m(1)).toEqual('+')
    expect(m(-1)).toEqual('-')
})

it('all cases handled', () => {

    const m = match<1 | 2>()
        .case(1, 'One')

    // @ts-expect-error Not all cases
    expect(m(1)).toEqual('One')
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