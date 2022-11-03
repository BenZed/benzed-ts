import match from './match'
import { Matcher } from './types'

import { expectTypeOf } from 'expect-type'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Tests ////

it('match.case() to create a match', () => {

    const match1to3 = match
        .case(1, 'one')
        .case(2, 'two')
        .case(3, 'three')
    
    expect(match1to3(1)).toEqual('one')

    expect(() => {
        // @ts-expect-error can't iterate
        for (const value of match1to3)
            void value
    }).toThrow('Match is not iterable')
})

it('.case()', () => {
    
    const m1 = match.case(0, 'zero')
    const m2 = m1.case(1, 'one')

    expectTypeOf(m1).toEqualTypeOf<Matcher<0, 'zero'>>()
    expectTypeOf(m2).toEqualTypeOf<Matcher<0 | 1, 'zero' | 'one'>>()

    // @ts-expect-error Match match 2, not a possible input
    expect(() => m2.value(2)).toThrow(`Unmatched value: ${2}`)

})

it('.default()', () => {

    const m1 = match
        .case(0, 'zero')
        .case(1, 'one')
        .default('non-binary')

    expectTypeOf(m1).toEqualTypeOf<Matcher<number, 'zero' | 'one' | 'non-binary'>>()

})