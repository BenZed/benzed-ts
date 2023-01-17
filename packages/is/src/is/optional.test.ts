import { Optional } from './optional'

import { it, expect } from '@jest/globals'
import { isString } from '../schema'
import { nil } from '@benzed/util'

//// Setup ////

const isOptionalString = new Optional(isString)

//// Tests ////

it('Makes a schematic optional', () => {
    expect(isOptionalString('')).toBe(true)
    expect(isOptionalString(nil)).toBe(true)
})

it('preserves defaults', () => {
    expect(isOptionalString.default('Cake').validate(nil))
        .toEqual('Cake')
})

it('required', () => {
    const isString = isOptionalString.required
    expect(isString('')).toBe(true)
    expect(isString(nil)).toBe(false)
})