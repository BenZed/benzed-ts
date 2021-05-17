import copy from '../copy'
import shuffle from './shuffle'

describe('shuffle()', () => {

    it('does not mutate original array', () => {
        const array = [0, 1, 2, 3, 4, 5]
        const array2 = copy(array)
        const clone = shuffle(array2)

        // proves unique did not mutate array
        expect(array2).toEqual(array)

        // proves output is not same as input
        expect(clone).not.toBe(array)
    })

    it('same behaviour as @benzed/array/shuffle', () => {
        const array = [0, 1, 2, 3, 4, 5]
        const clone = shuffle(array)
        shuffle(array)

        expect(clone.every(v => array.includes(v))).toBe(true)
        expect(clone.length).toEqual(array.length)
    })

    it('works on array-likes', () => {

        const arraylike = {
            0: 'base',
            1: 'ace',
            length: 2
        }

        const clone = shuffle(arraylike)
        shuffle(arraylike)

        expect(clone).not.toBe(arraylike)
        expect(clone).toHaveLength(arraylike.length)
    })

})