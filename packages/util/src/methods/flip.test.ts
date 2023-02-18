
import { test, it, expect, describe } from '@jest/globals'

import flip from './flip'

describe('flip', () => {
    it('flips two arguments', () => {
        expect(flip(1, 2)).toEqual([2, 1])
    })

    it('flips three arguments', () => {
        expect(flip('a', true, 42)).toEqual([42, true, 'a'])
    })

    it('flips an empty tuple', () => {
        expect(flip()).toEqual([])
    })
})