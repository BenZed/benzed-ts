import copy from '../copy'
import push from './push'

describe('push()', () => {
    it('does not mutate original array', () => {
        const array = [0, 1, 2, 3, 4, 5]

        const array2 = copy(array)
        const clone = push(array2, 6)

        // proves unique did not mutate array
        expect(array2).toEqual(array)

        // proves output is not same as input
        expect(clone).not.toEqual(array)
    })
    it('same behaviour as Array.prototype.push', () => {
        const array = [0, 1, 2, 3, 4, 5]
        const clone = push(array, 6)
        array.push(6)
        expect(clone).toEqual(array)
    })
    it('works on array-likes', () => {
        const arraylike = { 0: 'zero', 1: 'one', length: 2 }

        const clone = push(arraylike, 'two')
        Array.prototype.push.call(arraylike, 'two')

        expect(clone).not.toBe(arraylike)
        expect(clone).toEqual(arraylike)
        expect(clone).toHaveLength(3)
    })

})