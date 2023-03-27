import { expectTypeOf } from 'expect-type'
import { defined } from './defined'
import { it, expect, test, describe } from '@jest/globals'

const output = defined({ foo: 'string', bar: undefined })

it('defined()', () => {
    expect(output).toEqual({ foo: 'string' })
})

it('Defined', () => {
    expectTypeOf(output).toEqualTypeOf({ foo: 'string' })
})