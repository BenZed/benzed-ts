import { isFunc } from './func'
import { it, test, expect, describe } from '@jest/globals'

test('isFunc()', () => {
    expect(isFunc(() => 'foo')).toBe(true)
})