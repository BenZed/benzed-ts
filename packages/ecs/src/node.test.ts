import { expectTypeOf } from 'expect-type'
import { Component } from './component'

import { Pipe } from './nodes'

/*** Test Components ***/

const binary = Component.from(
    (i: boolean): number => i ? 1 : 0
)

const invert = Component.from(
    (i: boolean) => !i
)

const serialize = Component.from(
    (i: number | boolean) => `${i}`
)

const pipe = Pipe.create(invert)
    .add(binary)
    .add(serialize)

/*** Tests ***/

it('typesafe .get()', () => {

    const c1 = pipe.get(0)
    const c2 = pipe.get(1)
    const c3 = pipe.get(2)

    expectTypeOf<typeof c1>().toEqualTypeOf<Component<boolean, boolean>>()
    expectTypeOf<typeof c2>().toEqualTypeOf<Component<boolean, number>>()
    expectTypeOf<typeof c3>().toEqualTypeOf<Component<number | boolean, string>>()

})

it('typesafe .get() in range', () => {
    // @ts-expect-error Index out of range
    expect(() => pipe.get(3)).toThrow('Could not find component at index')
})

it('typesafe .get() by constructor', () => {

    class Shout extends Component<string> {

        compute(input: string): string {
            return `${input}!`
        }
    }

    class Unused extends Component {
        compute(input: unknown): unknown {
            return input
        }
    }
    
    const s1 = new Shout()

    const pipe = Pipe.create(serialize)
        .add(s1)

    const s2 = pipe.get(Shout)
    expect(s2).toBe(s1)

    expectTypeOf<typeof s2>().toEqualTypeOf<Shout>()

    // @ts-expect-error node does not have this component
    expect(() => pipe.get(Unused)).toThrow('Could not find component of type')
    
})

it('typesafe .first', () => {

    const { first } = pipe 

    expect(first).toEqual(pipe.get(0))
    expectTypeOf<typeof first>().toEqualTypeOf<Component<boolean, boolean>>()

})

it('typesafe .last', () => {

    const { last } = pipe 

    expect(last).toEqual(pipe.get(2))
    expectTypeOf<typeof last>().toEqualTypeOf<Component<number | boolean, string>>()

})
