import { expectTypeOf } from 'expect-type'
import { Component } from './component'

import { Pipe } from './nodes'

//// Test Components ////

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

const binary = Component.from(
    (i: boolean): number => i ? 1 : 0
)

const invert = Component.from(
    (i: boolean) => !i
)

const serialize = Component.from(
    (i: number | boolean) => `${i}`
)

const node = Pipe.create(invert)
    .add(binary)
    .add(serialize)
    .add(new Shout())

//// Tests ////

it(`typesafe .get()`, () => {

    const c1 = node.get(0)
    const c2 = node.get(1)
    const c3 = node.get(2)

    expectTypeOf<typeof c1>().toEqualTypeOf<Component<boolean, boolean>>()
    expectTypeOf<typeof c2>().toEqualTypeOf<Component<boolean, number>>()
    expectTypeOf<typeof c3>().toEqualTypeOf<Component<number | boolean, string>>()

})

it(`typesafe .get() in range`, () => {
    // @ts-expect-error Index out of range
    expect(() => node.get(4)).toThrow(`Could not find component at index`)
})

it(`typesafe .get() by constructor`, () => {
    
    const shouter = node.get(Shout)

    expectTypeOf<typeof shouter>().toEqualTypeOf<Shout>()

    // @ts-expect-error node does not have this component
    expect(() => node.get(Unused)).toThrow(`Could not find component of type`)
    
})

it(`typesafe .first`, () => {

    const { first } = node 

    expect(first).toBe(node.get(0))
    expectTypeOf<typeof first>().toEqualTypeOf<Component<boolean, boolean>>()

})

it(`typesafe .last`, () => {

    const { last } = node 

    expect(last).toBe(node.get(3))
    expectTypeOf<typeof last>().toEqualTypeOf<Shout>()

})

it (`typesafe .has`, () => {

    const hasZero = node.has(0)
    const hasFour = node.has(4)
    const hasShout = node.has(Shout)
    const hasUnused = node.has(Unused)

    expect(hasZero).toBe(true)
    expectTypeOf<typeof hasZero>().toEqualTypeOf<true>()

    expect(hasFour).toBe(false)
    expectTypeOf<typeof hasFour>().toEqualTypeOf<false>()

    expect(hasShout).toBe(true)
    expectTypeOf<typeof hasShout>().toEqualTypeOf<true>()

    expect(hasUnused).toBe(false)
    expectTypeOf<typeof hasUnused>().toEqualTypeOf<false>()

})