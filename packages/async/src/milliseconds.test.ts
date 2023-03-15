import milliseconds from './milliseconds'
import { describe, it, expect } from '@jest/globals'

//// Tests ////

describe('milliseconds', () => {

    it('returns a promise', () => {
        expect(milliseconds(0)).toBeInstanceOf(Promise)
    })

    it('resolves after a set number of milliseconds', async () => {
        const start = Date.now()
        await milliseconds(15)
        expect(Date.now() - start >= 15).toBe(true)
    })

})
