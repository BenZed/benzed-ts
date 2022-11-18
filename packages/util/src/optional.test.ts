
import { Optional, optional } from './optional'
import { expectTypeOf } from 'expect-type'
import { nil } from './nil'

it('creates optional objects with values', () => {

    const ace = optional(1)

    expect(ace.hasValue).toBe(true)
    expect(ace).toHaveProperty('value', 1)
})

it('creates optional objects without values', () => {
    for (const nil of [null, undefined]) {
        const none = optional(nil)
        expect(none.hasValue).toBe(false)
        expect(none).not.toHaveProperty('value')
    }
})

it('does not wrap optionals', () => {

    const o1 = optional(1)
    const o2 = optional(o1)

    expect(o2.hasValue).toBe(true)
    expect(o2).toHaveProperty('value', 1)

    expectTypeOf(o2).toMatchTypeOf<Optional<number>>()
})

it('callable optional chain signature', () => {

    const o1 = optional(1)(v => v * 2)
    expect(o1).toHaveProperty('value', 2)
})

it('callable optional chain siganture with default value', () => {

    const o2 = optional<string | nil>(nil)(v => `${v}?`, 'Eh')
    expect(o2).toHaveProperty('value', 'Eh?')
})