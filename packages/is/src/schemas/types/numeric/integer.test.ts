import { $integer as isInteger } from './integer'

it('integer', () => {
    expect(isInteger(2)).toBe(2)
    expect(() => isInteger('ace')).toThrow('Must be integer')
    expect(() => isInteger(2.5)).toThrow('Must be integer')
    expect(isInteger(2)).toEqual(2)
    expect(isInteger('2')).toEqual(2)
}) 