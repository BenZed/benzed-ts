import copy from '../copy'
import sort from './sort'

describe('sort()', () => {

    it('does not mutate original array', () => {
        const array = [1, 0, 4, 2, 5, 3]
        const array2 = copy(array)
        const array3 = sort(array2)

        // proves sort did not mutate array
        expect(array2).toEqual(array)

        // proves output is not same as input
        expect(array3).not.toEqual(array2)
    })

    it('same behaviour as Array.prototype.sort', () => {
        const array = [1, 0, 4, 2, 5, 3]
        const clone = sort(array)
        array.sort()
        expect(clone).toEqual(array)
    })

    it('works on array-likes', () => {
        const arraylike = { 0: 'base', 1: 'ace', length: 2 }

        const clone = sort(arraylike)
        Array.prototype.sort.call(arraylike)

        expect(clone).not.toBe(arraylike)
        expect(clone).toEqual(arraylike)
        expect(clone).toHaveLength(2)
    })

})