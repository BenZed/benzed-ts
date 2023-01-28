import { optional, Has, Optional } from './optional'

import { test, expect } from '@jest/globals'

import { expectTypeOf } from 'expect-type'
import { nil, toNil } from './nil'

//// Setup ////

const value = 'hello' as const
const something = optional(value)
const nothing = optional()

//// Tests ////

test('Create an optional value', () => {
    
    expect(something.has).toBe(true) 
    expect(something).toHaveProperty('value', value)
    if (something.has) {
        expectTypeOf(something).toEqualTypeOf<Has<typeof value>>()
        expectTypeOf(something.value).toEqualTypeOf<typeof value>()
    }
})

test('Optional value type excludes nil', () => {
    const str = nil as string | nil
    const maybeStr = optional(str)
    expectTypeOf(maybeStr).toEqualTypeOf<Optional<string>>() // not Optional<string | nil>
    expect(maybeStr.has).toBe(false)
})

describe('match method', () => {

    it('executes if has value', () => {

        const helloWorld = something(hello => `${hello}-world` as const)
        expect({ ...helloWorld }).toEqual({ has: true, value: `${value}-world` })

    })

    it('does not execute if no value', () => {
        const helloNothing = nothing(hello => hello)
        expect({ ...helloNothing }).toEqual({ has: false })
    })

    it('smart return value', () => {
        const smart = something(toNil)
        expectTypeOf(smart).toMatchTypeOf<Optional<typeof value>>()
    })

})

describe('assert method', () => {

    it('throws when called without value', () => {
        expect(() => nothing.assert()).toThrow('Does not have value')
    })

    it('custom error', () => {
        expect(() => nothing.assert('You have nothing')).toThrow('You have nothing')
    })

    it('returns value', () => {
        expect(something.assert()).toEqual('hello')
    })

    it('create with default error', () => {

        const msg = 'You are not keeping it 💯'

        const e1 = optional(nil, msg)
        const e2 = optional.nil(msg)
        // @ts-expect-error optional.value should not receive nil
        const e3 = optional.value(nil, msg)

        for (const e of [e1,e2,e3])
            expect(() => e.assert()).toThrow(msg)
    })
})
