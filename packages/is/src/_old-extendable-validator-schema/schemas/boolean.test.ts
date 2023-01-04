import { boolean } from './boolean'

//// Tests ////

it('validates booleans', () => {
    expect(boolean(true)).toEqual(true)
    expect(boolean(false)).toEqual(false)

    expect(() => boolean('what'))
        .toThrow('must be type boolean')
})

it('casts "true" to true', () => {
    expect(boolean.validate('true'))
        .toEqual(true)
})

it('casts "false" to false', () => {
    expect(boolean.validate('false'))
        .toEqual(false)
})

it('default()', () => {
    expect(boolean.default(false).validate(undefined)).toBe(false)
    expect(boolean.default(() => true).validate(undefined)).toBe(true)
})
