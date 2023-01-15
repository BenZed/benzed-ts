import { isArray } from './array'

//// Tests ////

it('returns true if something is an array', () => {
    expect(isArray([])).toBe(true)
    expect(isArray({})).toBe(false)
})

it('returns false if something is not an array', () => {
    expect(isArray(null)).toBe(false)
    expect(isArray.is(4)).toBe(false)
})

it('validates arrays', () => {
    expect(isArray.validate([''])).toEqual([''])  
    expect(isArray.validate([1,2,3,4])).toEqual([1,2,3,4])
    expect(() => isArray.validate(1)).toThrow('Must be type array')
}) 

it('asserts arrays', () => {
    expect(() => isArray.assert([])).not.toThrow()
    expect(() => isArray.assert({})).toThrow('Must be type array')
})
