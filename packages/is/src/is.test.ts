import { is } from './$'
import { expectTypeOf } from 'expect-type'
import { TypeGuard, TypeOf } from './types'

/*** Tests ***/

it('named "is"', () => {
    expect(is.name).toBe('is')
})

it('is.string', () => {

    expectTypeOf(is.string).toMatchTypeOf<TypeGuard<string>>()

    expect(is.string('string')).toBe(true)
    expect(is.string(0)).toBe(false)
    expect(is.string(true)).toBe(false)

    const value: unknown = 'hey'
    if (is.string(value))
        expectTypeOf(value).toEqualTypeOf<string>()

})

it('is.boolean', () => {

    expectTypeOf(is.boolean).toMatchTypeOf<TypeGuard<boolean>>()

    expect(is.boolean('string')).toBe(false)
    expect(is.boolean(0)).toBe(false)
    expect(is.boolean(true)).toBe(true)

    const value: unknown = true
    if (is.boolean(value))
        expectTypeOf(value).toEqualTypeOf<boolean>()

})

it('is.number', () => {

    expectTypeOf(is.number).toMatchTypeOf<TypeGuard<number>>()

    expect(is.number('string')).toBe(false)
    expect(is.number(0)).toBe(true)
    expect(is.number(true)).toBe(false)

    const value: unknown = true
    if (is.number(value))
        expectTypeOf(value).toEqualTypeOf<number>()

})

it('is.number.or.boolean', () => {

    expectTypeOf(is.number.or.boolean).toMatchTypeOf<TypeGuard<boolean | number>>()

    expect(is.number.or.boolean('string')).toBe(false)
    expect(is.number.or.boolean(0)).toBe(true)
    expect(is.number.or.boolean(true)).toBe(true)

})