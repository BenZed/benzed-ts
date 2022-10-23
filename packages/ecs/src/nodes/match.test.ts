import { Match } from './match'
import { Component, InputOf, OutputOf } from '../component'

import { expectTypeOf } from 'expect-type'

import is from '@benzed/is'

/*** Test Components ***/

const double = Component.from(
    (i: number) => i * 2
)

const deserialize = Component.from(
    (i: string) => i === 'true'
        ? true 
        : i === 'false' 
            ? false 
            : parseFloat(i)
)

/*** Tests ***/
    
it('sealed class', () => {
    // @ts-expect-error Private constructor
    void class extends Match<[]> {}
})

it('can be created with a value and a component', () => {
    const match = Match.create(1, double)

    expect(match.compute(1)).toEqual(2)
    
    expectTypeOf<InputOf<typeof match>>().toEqualTypeOf<1>()
    expectTypeOf<OutputOf<typeof match>>().toEqualTypeOf<number>()
})

it('can be created with values and a component', () => {
    const match = Match.create([1, 2, 3] as const, double)

    expect(match.compute(1)).toEqual(2)
    expect(match.compute(2)).toEqual(4)
    expect(match.compute(3)).toEqual(6)
    
    expectTypeOf<InputOf<typeof match>>().toEqualTypeOf<1 | 2 | 3>()
    expectTypeOf<OutputOf<typeof match>>().toEqualTypeOf<number>()
})

it('created with predicate and a component', () => {

    const match = Match.create((i: number) => i > 0, double)
    expect(match.compute(2)).toEqual(4)

    expectTypeOf<InputOf<typeof match>>().toEqualTypeOf<number>()
    expectTypeOf<OutputOf<typeof match>>().toEqualTypeOf<number>()

})

it('created with a typeguard and a component', () => {
    const match = Match.create(is.number, double)
    expect(match.compute(5)).toEqual(10)

    expectTypeOf<InputOf<typeof match>>().toEqualTypeOf<number>()
    expectTypeOf<OutputOf<typeof match>>().toEqualTypeOf<number>()
})

it('.add() to add matchers', () => {

    const match = Match
        .create(is.number, double)
        .add(is.string, deserialize)

    expectTypeOf<InputOf<typeof match>>().toEqualTypeOf<number | string>()
    expectTypeOf<OutputOf<typeof match>>().toEqualTypeOf<number | boolean>()
})

it('throws if match cannot be found', () => {
    const match = Match.create((i: number) => i >= 0, i => `${i} is positive!`)
    expect(() => match.compute(-1)).toThrow(`Component could not be matched for input ${-1}`)
})