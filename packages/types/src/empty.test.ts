import { Empty, isEmpty } from './empty'
import { expectTypeOf } from 'expect-type'

import { it, expect, test, describe } from '@jest/globals'

it('isEmpty', () => {
    expect(isEmpty({})).toBe(true)
})

it('is not empty', () => {
    expect(isEmpty({ foo: 'bar' })).toBe(false)
})

it('Empty type', () => {
    const value: unknown = null
    if (isEmpty(value))
        expectTypeOf(value).toEqualTypeOf<Empty>()
})