import { IsUnion } from './is-union'

import { test, expect } from '@jest/globals'
import { IsValue } from '../is-value'

//// Tests ////

test(`${IsUnion.name}`, () => {
    const isOneOrZero = new IsUnion(new IsValue(0 as const), new IsValue(1 as const))

    expect(isOneOrZero(0)).toEqual(true)
    expect(isOneOrZero(1)).toEqual(true)
    expect(isOneOrZero(2)).toEqual(false)
})
