import match from './match'
import { Match, MatchBuilder } from './types'

import { expectTypeOf } from 'expect-type'
import is from '@benzed/is'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Tests ////

it('match.case() to create a match', () => {

    const match1to3 = match
        .case(1, 'one')
        .case(2, 'two')
        .case(3, 'three')
    
    expect(match1to3(1))
        .toEqual('one')

    expect(() => {
        // @ts-expect-error can't iterate
        for (const value of match1to3)
            void value
    }).toThrow('Match is not iterable')
})

it('match.case() as well', () => {
    
    const m1 = match.case(0, 'zero')
    const m2 = m1.case(1, 'one')

    expectTypeOf(m1).toEqualTypeOf<MatchBuilder<0, 'zero'>>()
    expectTypeOf(m2).toEqualTypeOf<MatchBuilder<0 | 1, 'zero' | 'one'>>()

    // @ts-expect-error Match match 2, not a possible input
    expect(() => m2.value(2))
        .toThrow(`Unmatched value: ${2}`)

})

it('explicit I/O types', () => {

    const m1 = match
        .case<string, boolean>('Hello', true)
        .case('Goodbye', false)

    expectTypeOf(m1)
        .toEqualTypeOf<MatchBuilder<string, boolean>>()
})

it('explicit Match type', () => {

    type BinaryMatch = Match<0 | 1, 'Zero' | 'One'>

    const b1: BinaryMatch = match
        .case(0, 'Zero')
        .case(1, 'One')

    expectTypeOf(b1)
        .toEqualTypeOf<MatchBuilder<0 | 1, 'Zero' | 'One'>>()

    // @ts-expect-error Bad Type
    const b2: BinaryMatch = match
        .case(0, 'Zero')
        .case(1, 'One')
        .case(2, 'Two') // <- no good

    void b2
})

it('.case() with enums', () => {

    enum FuzzyBool {
        Yes,
        No,
        Maybe
    }

    const m1 = match
        .case(FuzzyBool.Yes, 'Yes')
        .case(FuzzyBool.No, 'No')
        .case(FuzzyBool.Maybe, 'Maybe')

    expectTypeOf(m1)
        .toEqualTypeOf<MatchBuilder<FuzzyBool, 'Yes' | 'No' | 'Maybe'>>()

    // @ts-expect-error Match incomplete
    const m2: Match<FuzzyBool, 0 | 1 | 2> = match
        .case(FuzzyBool.Yes, 0)
        .case(FuzzyBool.No, 1)
    void m2
})

it('.default()', () => {

    const m1 = match
        .case(0, 'zero')
        .case(1, 'one')
        .default('non-binary')

    expectTypeOf(m1)
        .toEqualTypeOf<MatchBuilder<number, 'zero' | 'one' | 'non-binary'>>()

})

describe('typeguard input', () => {

    it('all typeguards', () => {

        const isFoo = (i: unknown): i is { foo: 'bar' } => is.object<{foo: string}>(i) && i.foo === 'bar'

        const sort = match
            .case(is.number, 'Number')
            .case(is.string, 'String')
            .case(isFoo, 'FooBar')

        expect(sort(100)).toEqual('Number')
        expect(sort('hey')).toEqual('String')
        expect(sort({ foo: 'bar' })).toEqual('FooBar')

    })

    it('conditional guards', () => {

        const isNumber = (f: (x: number) => boolean) => 
            (i: unknown): i is number => typeof i === 'number' && f(i)

        const water = match
            .case(isNumber(i => i <= 0), 'ice')    
            .case(isNumber(i => i > 0 && i < 100), 'liquid')
            .case(isNumber(i => i >= 100), 'steam')
    
        expectTypeOf(water).toMatchTypeOf<MatchBuilder<number, 'ice' | 'liquid' | 'steam'>>()
        expect(water(0)).toBe('ice')
        expect(water(5)).toBe('liquid')
        expect(water(100)).toBe('steam')
    })

    it('mixed guards/values', () => {

        const m1 = match
            .case(100, 'One Hundred')
            .case(true, 'One')
            .case(false, 'Zero')
            .case(is.number, 'Number')

        expect(m1(100)).toEqual('One Hundred')
        expect(m1(true)).toEqual('One')
        expect(m1(false)).toEqual('Zero')
        expect(m1(50)).toEqual('Number')

    })

    it('must be a type predicate', () => {

        // @ts-expect-error predicate no good
        match.case((i: boolean) => i, 'PreTask')

    })
})
