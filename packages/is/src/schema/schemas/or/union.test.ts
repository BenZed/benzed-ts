import { Union } from './union'

import { test, expect } from '@jest/globals'
import { Value } from '../value'

//// Tests ////

test(`${Union.name}`, () => {
    const isOneOrZero = new Union(new Value(0 as const), new Value(1 as const))

    expect(isOneOrZero(0)).toEqual(true)
    expect(isOneOrZero(1)).toEqual(true)
    expect(isOneOrZero(2)).toEqual(false)
})
