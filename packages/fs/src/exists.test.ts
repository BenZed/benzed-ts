import { exists } from './exists'
import { it, expect } from '@jest/globals'

it('returns true if a file or directory exists', async () => {
    expect(await exists('./src')).toBe(true)
})

it('returns false if a file or directory does not exist', async () => {
    expect(await exists('./monkey')).toBe(false)
})