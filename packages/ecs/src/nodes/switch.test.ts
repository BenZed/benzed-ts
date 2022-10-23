
import { expectTypeOf } from 'expect-type'
import { Component, OutputOf } from '../component'
import { Switch } from './switch'

import { isSortedArray } from '@benzed/is'

/*** Test Components ***/

const multiply = (by: number) => (i: number) => i * by

const x2 = Component.from(multiply(2))
const x3 = Component.from(multiply(3))
const x4 = Component.from(multiply(4))

const multiplier = Switch.create(x2)
    .add(x3)
    .add(x4)

/*** Tests ***/
    
it('sealed class', () => {
    // @ts-expect-error Private constructor
    void class extends Switch<[]> {}
})

it('switches input on each invocation', () => {
    expect(multiplier.compute(1)).toEqual(2)
    expect(multiplier.compute(1)).toEqual(3)
    expect(multiplier.compute(1)).toEqual(4)
    expect(multiplier.compute(1)).toEqual(2)
})

it('different outputs result in a union', () => {

    const fancy = Switch.create(x2)
        .add(i => `${i}`)
        .add(i => !i)

    expect(fancy.compute(1)).toBe(2)
    expect(fancy.compute(1)).toBe('1')
    expect(fancy.compute(1)).toBe(false)

    type FancyOutput = OutputOf<typeof fancy>

    expectTypeOf<FancyOutput>().toEqualTypeOf<number | string | boolean>()

})

it('random option', () => {

    const rMultiplier = Switch.create(x2, { random: true })
        .add(x3)
        .add(x4)

    for (let i = 0; i < 100; i++) {
        const results = [1,1,1].map(rMultiplier.compute)
        if (!isSortedArray(results))
            return 
    }

    throw new Error('Array is not sorted')
})

