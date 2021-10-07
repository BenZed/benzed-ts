import isSortedArray from './is-sorted-array'

describe('isSortedArray()', () => {

    it('returns true if the given array is sorted', () => {
        expect(
            isSortedArray(
                [0, 1, 2, 3, 4, 5]
            )
        ).toBe(true)
    })

    it('returns true if the given array is not sorted', () => {
        expect(
            isSortedArray(
                [5, 1, 7, 3, 0]
            )
        ).toBe(false)
    })

    it('works on descending-sorted arrays', () => {
        expect(
            isSortedArray(
                [5, 4, 3, 2, 1, 0]
            )
        ).toBe(true)
    })

})