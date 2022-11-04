import match from './match'
import { Match, Matcher } from './types'

import { expectTypeOf } from 'expect-type'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Tests ////

it('match() to create a match', () => {

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

    expectTypeOf(m1).toEqualTypeOf<Matcher<0, 'zero'>>()
    expectTypeOf(m2).toEqualTypeOf<Matcher<0 | 1, 'zero' | 'one'>>()

    // @ts-expect-error Match match 2, not a possible input
    expect(() => m2.value(2))
        .toThrow(`Unmatched value: ${2}`)

})

it('explicit types', () => {

    const m1 = match
        .case<string, boolean>('Hello', true)
        .case('Goodbye', false)

    expectTypeOf(m1)
        .toEqualTypeOf<Matcher<string, boolean>>()
})

it('explicit declaration', () => {

    type BinaryMatch = Match<0 | 1, 'Zero' | 'One'>

    const b1: BinaryMatch = match
        .case(0, 'Zero')
        .case(1, 'One')

    expectTypeOf(b1)
        .toEqualTypeOf<Matcher<0 | 1, 'Zero' | 'One'>>()

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
        .toEqualTypeOf<Matcher<FuzzyBool, 'Yes' | 'No' | 'Maybe'>>()

    // @ts-expect-error Match incomplete
    const m2: Match<FuzzyBool, 0 | 1 | 2> = match()
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
        .toEqualTypeOf<Matcher<number, 'zero' | 'one' | 'non-binary'>>()

})