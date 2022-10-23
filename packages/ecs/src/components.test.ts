import { Match, Pipe } from './components'
import { expectTypeOf } from 'expect-type'
import { Component, InputOf, OutputOf } from './component'
import { $ } from '@benzed/schema'

/*** Computers ***/

const double = Component.plain(
    i => i * 2,
    $.number.is
)

const binary = Component.plain(
    (i):number => i ? 1 : 0,
    $.boolean.is
)

const invert = Component.plain(
    i => !i,
    $.boolean.is
)

const serialize = Component.plain(
    i => `${i}`,
    $.or($.number, $.boolean).is
)

const deserialize = Component.plain(
    i => i === 'true'
        ? true 
        : i === 'false' 
            ? false 
            : parseFloat(i),
    $.string.is
)

/*** Test ***/

describe('MultiComponent', () => {
    it('typesafe .get()', () => {
        const pipe = Pipe.create(invert)
            .add(binary)
            .add(serialize)

        const c1 = pipe.get(0)
        const c2 = pipe.get(1)
        const c3 = pipe.get(2)

        expectTypeOf<typeof c1>().toMatchTypeOf<Component<boolean, boolean>>()
        expectTypeOf<typeof c2>().toMatchTypeOf<Component<boolean, number>>()
        expectTypeOf<typeof c3>().toMatchTypeOf<Component<number | boolean, string>>()
 
        // @ts-expect-error Index out of range
        pipe.get(3)
    })

    it('typesafe .first/.last', () => {

        const pipe = Pipe.create(invert)
            .add(binary)
            .add(serialize)

        const { first, last } = pipe 

        expect(first).toEqual(pipe.get(0))
        expect(last).toEqual(pipe.get(2))

        expectTypeOf<typeof first>().toMatchTypeOf<Component<boolean, boolean>>()
        expectTypeOf<typeof last>().toMatchTypeOf<Component<number | boolean, string>>()
    })
})

describe('Pipe', () => {

    it('chains the output of other components', () => {

        const pipe = Pipe
            .create(double)
            .add(double)
            .add(double)
            .add(double)

        expect(pipe.compute(2)).toBe(32)
    
    })

    it('can only add components that having input matching last components output', () => {
        Pipe.create(double)
            // @ts-expect-error invalid input
            .add(invert)

        Pipe.create(deserialize)
            .add(invert)

        Pipe.create(deserialize)
    })

    it('sealed class', () => {
    // @ts-expect-error Private constructor
        void class extends Pipe<[]> {}
    })

})

describe('Match', () => {

    const match = Match
        .create(deserialize)
        .add(binary)
        .add(double)

    it('sealed class', () => {
        // @ts-expect-error Private constructor
        void class extends Match<[]> {}
    })

    it('matches an input against that of it\'s components', () => {
        expect(match.compute(1)).toEqual(2)
        expect(match.compute('123')).toEqual(123)
        expect(match.compute(false)).toEqual(0)
    })

    it('input is union of component inputs', () => {
        type Input = InputOf<typeof match>
        expectTypeOf<Input>().toMatchTypeOf<string | number | boolean>()
    })

    it('output is union of component outputs', () => {
        type Output = OutputOf<typeof match>
        expectTypeOf<Output>().toEqualTypeOf<number | boolean>()
    })

})