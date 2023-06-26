import { pick } from './pick'
import { isRecord } from './guards'
import { it, expect, describe } from '@jest/globals'

describe(pick.name, () => {
    it('returns a new object of given keys', () => {
        const input = {
            a: 0, 
            b: false,
            c: 'c'
        }

        expect(pick(input, 'a', 'b')).toEqual({
            a: 0,
            b: false
        })
    })

    it('handles undefined correctly', () => {
        const input = {
            a: 0,
            b: undefined
        }

        expect(pick(input, 'a', 'b')).toEqual({ 
            a: 0,
            b: undefined
        })
    })

    it('returns correct output when called with more than one argument', () => {
        const input = {
            a: 0,
            b: false,
            c: 'c'
        }

        const result = pick(input, 'a', 'b')

        expect(isRecord(result)).toBe(true)
        expect(result).toEqual({
            a: 0,
            b: false
        })
    })
})

describe('pick', () => {
    it('includes symbolic properties correctly', () => {

        const $$base = Symbol('base')
        const $$extend = Symbol('extend')

        const object = { [$$base]: true, [$$extend]: true, hey: false }
        const picked = pick(object, $$base, $$extend)

        expect(picked[$$base]).toBe(true)
        expect(picked[$$extend]).toBe(true)
        expect(picked).not.toHaveProperty('hey')
    })
})
