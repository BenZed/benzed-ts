import { isNumber } from '@benzed/is'

import { UnmatchedValueError } from './error'

import { match } from './match'
import { MatchExpression, MatchExpressionBuilder } from './types'

import { expectTypeOf } from 'expect-type'

//// Setup ////

enum Answer {
    Yes,
    No,
    Maybe
}

//// Tests ////

it('create an expression for a value', () => {

    const exp = match(1)
        .case(1, 'One')

    expectTypeOf(exp).toEqualTypeOf<MatchExpression<1,'One'>>

    const [one] = exp
    expect(one).toEqual('One')
})

it('create an expression for a set of values', () => {

    const exp = match(1,2,3)
        .case(1, 'One')
        .case(2, 'Two')
        .case(3, 'Three')

    expect([...exp]).toEqual(['One', 'Two', 'Three'])
})

it('expression is not iterable until all input cases have been handled', () => {

    const exp = match(1,2,3)
        .case(1, 'One')
        .case(2, 'Two')

    // @ts-expect-error Not all match cases have been covered
    const [one] = exp
    void one
})

it('create a match expression with an enum', () => {

    const [ answer ] = match(Answer.Yes as Answer)
        .case(Answer.Yes, 'Yes')
        .case(Answer.No, 'No')
        .case(Answer.Maybe, 'Maybe')

    expect(answer).toEqual('Yes')
})

it('with explicit input type', () => {

    const [answer] = match<Answer>(Answer.No)
        .case(Answer.Yes, 'Yes')
        .case(Answer.No, 'No')
        .case(Answer.Maybe, 'Maybe')

    expect(answer).toEqual('No')
})

it('enums handle default cases', () => {

    const [yes, what] = match<string[]>('yes', 'what')
        .case('yes', Answer.Yes)
        .case('no', Answer.No)
        .case('maybe', Answer.Maybe)
        .default(null)

    expect(yes).toEqual(Answer.Yes)
    expect(what).toEqual(null)
})

it('with generic input type', () => {

    const unfinishedExp = match(100 as number)
        .case(10, 'Ten')
        .case(1, 'One')

    expectTypeOf(unfinishedExp).toEqualTypeOf<MatchExpressionBuilder<number, number, 'Ten' | 'One'>>()

    expect(() => {
        // @ts-expect-error No default case
        const [x] = unfinishedExp
        void x
    }).toThrow(UnmatchedValueError)

    const finishedExp = unfinishedExp.default('Number')
    expectTypeOf(finishedExp).toEqualTypeOf<MatchExpression<number, 'Ten' | 'One' | 'Number'>>()
})

it('with objects', () => {

    const exp = match({ foo: 'bar' } as const, { foo: 'baz' } as const)
        .case({ foo: 'bar' } as const, 'BAR')
        .case({ foo: 'baz' }, 'BAZ')
   
    const [ bar, baz ] = exp    

    expectTypeOf(exp).toMatchTypeOf<

    /**/ MatchExpression<
    /**/ { readonly foo: 'bar' } | 
    /**/ { readonly foo: 'baz' }, 
    /**/ 'BAR' | 'BAZ'>

    >()
    
    expect(bar).toEqual('BAR')
    expect(baz).toEqual('BAZ')

})

it('with functions', () => {

    const exp = match(1, 2, 'ace')
        .case(i => isNumber(i) && i % 2 === 0, 'Even')
        .case(i => isNumber(i) && i % 2 === 1, 'Odd')
        .case('ace', 'Ace')
        .default('Number')

    expectTypeOf(exp)
        .toEqualTypeOf<
    
    /**/ MatchExpression<
    /**/ string | number, 
    /**/ 'Even' | 'Odd' | 'Ace' | 'Number'>
    
    >()
})

it('with function output', () => {

    const exp = match(1,2,3)
        .case(1, i => i * 2)
        .case(2, i => i * 3)
        .case(3, i => i * 4)

    expectTypeOf(exp).toEqualTypeOf<MatchExpression<1 | 2 | 3, number>>()

    expect([...exp]).toEqual([2, 6, 12])

})

it.todo('with typeguard input')
