import copy from '../copy'
import pop from './pop'

describe(`pop()`, () => {

    it(`does not mutate original array`, () => {
        const array = [0, 1, 2, 3, 4, 5]
        const array2 = copy(array)
        const clone = pop(array2)

        // proves unique did not mutate array
        expect(array2).toEqual(array)

        // proves output is not same as input
        expect(clone).not.toBe(array)
    })

    it(`same behaviour as Array.prototype.pop`, () => {
        const array = [0, 1, 2, 3, 4, 5]
        const clone = pop(array)
        array.pop()
        expect(clone).toEqual(array)
    })

    it(`works on array-likes`, () => {
        const arraylike = { 0: `zero`, 1: `one`, length: 2 }

        const clone = pop(arraylike)
        Array.prototype.pop.call(arraylike)

        expect(clone).not.toBe(arraylike)
        expect(clone).toEqual(arraylike)
        expect(clone).toHaveLength(1)
    })
})