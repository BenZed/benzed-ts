import { expectTypeOf } from 'expect-type'
import { defined } from './defined'

const output = defined({ foo: 'string', bar: undefined })

it('defined()', () => {
    expect(output).toEqual({ foo: 'string' })
})

it('Defined', () => {
    expectTypeOf(output).toEqualTypeOf({ foo: 'string' })
})