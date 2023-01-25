
import { isArray as _isArray } from '@benzed/util'

import { ReadOnly } from './readonly'

import { it, expect } from '@jest/globals'

import { expectTypeOf } from 'expect-type'
import { Validator } from '../../../../validator'

//// Setup ////

const $array = new Validator({ is: (i): i is unknown[] => _isArray(i), 'error': 'Must be an array' })

const $readonlyArray = new ReadOnly($array)

//// Tests ////

it('wraps given schematic', () => {
    expect($readonlyArray([])).toBe(true)
})

it('changes the output type of given properties to be readonly', () => {
    const output = {
        valid: $array([])
    }
    expectTypeOf(output)
        .toMatchTypeOf<{ valid: unknown[] }>()

    const readonlyOutput = {
        valid: $readonlyArray([])
    }
    expectTypeOf(readonlyOutput)
        .toMatchTypeOf<{ valid: readonly unknown[] }>()
})

it('writable', () => {
    const $array = $readonlyArray.writable
    const output = {
        valid: $array([])
    }
    expectTypeOf(output)
        .toMatchTypeOf<{ valid: unknown[] }>()
})