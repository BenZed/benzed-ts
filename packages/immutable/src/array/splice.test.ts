import copy from '../copy'
import splice from './splice'

describe.only('splice()', () => {

    it('does not mutate original array', () => {
        const array = [0, 1, 2, 3, 4, 5]
        const array2 = copy(array)
        const clone = splice(array2, 2, 1)

        // proves unique did not mutate array
        expect(array2).toEqual(array)

        // proves output is not same as input
        expect(clone).not.toBe(array)
    })

    it('same behaviour as Array.prototype.splice', () => {
        const array = [0, 1, 2, 3, 4, 5]
        const clone = splice(array, 2, 1)
        array.splice(2, 1)
        expect(clone).toEqual(array)
    })

    it('works on array-likes', () => {
        const arrayLike = { 0: 'zero', 1: 'one', length: 2 }

        const clone = splice(arrayLike, 0, 0, 'one-point-five')
        Array.prototype.splice.call(arrayLike, 0, 0, 'one-point-five')

        expect(clone).not.toBe(arrayLike)
        expect(clone).toEqual(arrayLike)
        expect(clone).toHaveLength(3)
    })

})