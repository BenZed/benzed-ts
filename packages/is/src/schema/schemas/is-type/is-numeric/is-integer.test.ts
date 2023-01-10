import { isInteger } from './is-integer'

it.skip('is-integer', () => {
    expect(isInteger(0.5)).toBe(false)
    expect(isInteger(2)).toBe(true)
    expect(() => isInteger.validate('ace')).toThrow('Must be type integer')
    expect(() => isInteger.validate(2.5)).toThrow('Must be type integer')
    expect(() => isInteger.validate(2)).toEqual(2)
    expect(() => isInteger.validate('2')).toEqual(2)
})