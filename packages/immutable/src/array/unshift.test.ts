import copy from '../copy'
import unshift from './unshift'

describe('unshift()', () => {

    it('does not mutate original array', () => {
        const array = [0, 1, 2, 3, 4, 5]
        const array2 = copy(array)
        const clone = unshift(array2, -1)

        // proves unique did not mutate array
        expect(array2).toEqual(array)

        // proves output is not same as input
        expect(clone).not.toBe(array)
    })

    it('same behaviour as Array.prototype.unshift', () => {
        const array = [0, 1, 2, 3, 4, 5]
        const clone = unshift(array, -1)
        array.unshift(-1)
        expect(clone).toEqual(array)
    })

    it('works on array-likes', () => {
        const arraylike = { 0: 'zero', 1: 'one', length: 2 }

        const clone = unshift(arraylike, 'minus-one')
        Array.prototype.unshift.call(arraylike, 'minus-one')

        expect(clone).not.toBe(arraylike)
        expect(clone).toEqual(arraylike)
        expect(clone).toHaveLength(3)
    })

})