import { ReadOnly } from './readonly'

import { it, expect } from '@jest/globals'
import { isArray } from '../schema'

import { expectTypeOf } from 'expect-type'

//// Setup ////

const isReadonlyArray = new ReadOnly(isArray)

//// Tests ////

it('wraps given schematic', () => {
    expect(isReadonlyArray([])).toBe(true)
})

it('changes the output type of given properties to be readonly', () => {
    const output = {
        valid: isArray.validate([])
    }
    expectTypeOf(output)
        .toMatchTypeOf<{ valid: unknown[] }>()

    const readonlyOutput = {
        valid: isReadonlyArray.validate([])
    }
    expectTypeOf(readonlyOutput)
        .toMatchTypeOf<{ valid: readonly unknown[] }>()
})

it('writable', () => {
    const isArray = isReadonlyArray.writable
    const output = {
        valid: isArray.validate([])
    }
    expectTypeOf(output)
        .toMatchTypeOf<{ valid: unknown[] }>()
})