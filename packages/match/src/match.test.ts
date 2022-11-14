import match from './match'
import { Match, Matcher } from './types'

import is, { isBoolean, isNumber, isString } from '@benzed/is'

import {
    NoMultipleDefaultCasesError,
    NotMatchExpressionError, 
    UnmatchedValueError

} from './error'

import { expectTypeOf } from 'expect-type'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Tests ////

it('match() to create a match', () => {
    
    const m1 = match().case(0, 'zero')
    const m2 = m1.case(1, 'one')

    expectTypeOf(m1).toEqualTypeOf<Matcher<unknown, 0, 'zero'>>()
    expectTypeOf(m2).toEqualTypeOf<Matcher<unknown, 0 | 1, 'zero' | 'one'>>()

    // @ts-expect-error Match match 2, not a possible input
    expect(() => m2.value(2))
        .toThrow(UnmatchedValueError)

})

it('mnon iterable', () => {

    const match1to3 = match()
        .case(1, 'one')
        .case(2, 'two')
        .case(3, 'three')
    
    expect(match1to3(1))
        .toEqual('one')

    expect(() => {
        // @ts-expect-error can't iterate
        for (const value of match1to3)
            void value
    }).toThrow(NotMatchExpressionError)
})

it('explicit I/O types', () => {

    const m1 = match()
        .case<string, boolean>('Hello', true)
        .case('Goodbye', false)

    expectTypeOf(m1)
        .toEqualTypeOf<Matcher<unknown, string, boolean>>()
})

it('explicit Match type', () => {

    type BinaryMatch = Match<0 | 1, 'Zero' | 'One'>

    const b1: BinaryMatch = match()
        .case(0, 'Zero')
        .case(1, 'One')

    expectTypeOf(b1)
        .toEqualTypeOf<Matcher<unknown, 0 | 1, 'Zero' | 'One'>>()

    // @ts-expect-error Bad Type
    const b2: BinaryMatch = match()
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

    const m1 = match()
        .case(FuzzyBool.Yes, 'Yes')
        .case(FuzzyBool.No, 'No')
        .case(FuzzyBool.Maybe, 'Maybe')

    expectTypeOf(m1)
        .toEqualTypeOf<Matcher<unknown, FuzzyBool, 'Yes' | 'No' | 'Maybe'>>()

    // @ts-expect-error Match incomplete
    const m2: Match<FuzzyBool, 0 | 1 | 2> = match()
        .case(FuzzyBool.Yes, 0)
        .case(FuzzyBool.No, 1)
    void m2
})

it('.default()', () => {

    const m1 = match()
        .case(0, 'zero')
        .case(1, 'one')
        .default('non-binary')

    expectTypeOf(m1)
        .toEqualTypeOf<Matcher<unknown, number, 'zero' | 'one' | 'non-binary'>>()

})

it('.default() multiple times throws', () => {

    // @ts-expect-error .default() twice not supported by types anyway
    expect(() => match().case(0, 'Zero').default('One').default('Two'))
        .toThrow(NoMultipleDefaultCasesError)

})

describe('method input', () => {

    it('all typeguards', () => {

        const isFoo = (i: unknown): i is { foo: 'bar' } => is.object<{foo: string}>(i) && i.foo === 'bar'

        const sort = match()
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

        const water = match()
            .case(isNumber(i => i <= 0), 'ice')    
            .case(isNumber(i => i > 0 && i < 100), 'liquid')
            .case(isNumber(i => i >= 100), 'steam')
    
        expectTypeOf(water).toMatchTypeOf<Matcher<unknown, number, 'ice' | 'liquid' | 'steam'>>()
        expect(water(0)).toBe('ice')
        expect(water(5)).toBe('liquid')
        expect(water(100)).toBe('steam')
    })

    it('mixed guards/values', () => {

        const m1 = match()
            .case(100, 'One Hundred')
            .case(true, 'One')
            .case(is.number, 'Number')
            .default('Zero')

        expect(m1(100)).toEqual('One Hundred')
        expect(m1(true)).toEqual('One')
        expect(m1(false)).toEqual('Zero')
        expect(m1(50)).toEqual('Number')

    })

    it('regular methods of unknown type', () => {
        const m1 = match().case(i => i, 'Truthy').default('Falsy')

        expect(m1(0)).toBe('Falsy')
        expect(m1(1)).toBe('Truthy')
    })

    it('default method', () => {

        const m1 = match()
            .case('One', 1)
            .case('Two', 2)
            .default(i => `${i}!`)

        expect(m1('3')).toEqual('3!')
        expectTypeOf(m1).toMatchTypeOf<Match<string, 1 | 2 | string>>()

    })
})

describe('objects', () => {

    it('objects are checked for deep equality', () => {

        const m1 = match()
            .case({ foo: 'bar' }, 'FooBar')
            .case({ bar: 'foo' }, 'BarFoo')

        expect(m1({ foo: 'bar'})).toEqual('FooBar')
        expect(m1({ bar: 'foo'})).toEqual('BarFoo')
        expect(() => m1({ foo: 'baz' })).toThrow(UnmatchedValueError)
    })

    it('objects and primitives', () => {
    
        const m1 = match()
            .case({ ace: [0,1,2,3] } as const, 'Wheel')
            .case('Base', 'Base')

        expect(m1({ ace: [0,1,2,3] })).toEqual('Wheel')
        expect(m1('Base')).toEqual('Base')
        // @ts-expect-error Invalid input
        expect(() => m1({ ace: [0, 1 ] })).toThrow(UnmatchedValueError)
        
    })

    it('objects with default', () => {

        const m1 = match()
            .case(0, 'Zero')
            .case(1, 'One')
            .case({ ten: 10 } as const, 'Ten')
            .default('Unknown')

        expectTypeOf(m1)
            .toEqualTypeOf<Matcher<unknown, number | { ten: number}, 'Zero' | 'One' | 'Ten' | 'Unknown'>>()     
    })

})

describe('method output', () => {

    it('outputs strongly typed', () => {

        const m1 = match()
            .case(100, n => ({ hundy: n }))
            .case(20, n => ({ twenty: n }))

        expectTypeOf(m1).toEqualTypeOf<Matcher<unknown, 20 | 100, { hundy: 100 } | { twenty: 20 }>>()

    })
    
    it('union method output', () => {

        const m1 = match()
            .case(isNumber, i => i > 50 ? 'Big' : 'Small')
            .case(isString, i => `${i}!` as const)

        expect(m1(0)).toEqual('Small')
        expect(m1(100)).toEqual('Big')
        expect(m1('Hey')).toEqual('Hey!')
    })

})

describe('nested match expressions', () => {

    it('can handle nested expressions', () => {

        const m1 = match()
        
            .case(isNumber, i => match(i)
                .case(i => i > 0, '+')
                .case(i => i < 0, '-')
                .default(0)

            ).case(isBoolean, i => match(i) 
                .case(true, '+')
                .case(false, '-')
            )

        expect(m1(100)).toBe('+')
        expect(m1(-100)).toBe('-')
        expect(m1(0)).toBe(0)
        expect(m1(true)).toBe('+')
        expect(m1(false)).toBe('-')

        expectTypeOf(m1).toEqualTypeOf<Match<number | boolean, 0 | '+' | '-'>>()
    })

    it('optimize nested matches', () => {

        let buildMatchCalls = 0

        const m1 = match().case(isString, i => {
            buildMatchCalls++
            return match(i).case('Hi!', 'Hello?').default('Fuck Off.')
        })

        expect(m1('Hi!')).toEqual('Hello?')
        expect(m1('Wtf')).toEqual('Fuck Off.')
        expect(buildMatchCalls).toBe(1)
    })

})