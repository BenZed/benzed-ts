import isSortedArray from './is-sorted-array'

describe('isSortedArray()', () => {

    it('returns true if the given array is sorted', () => {
        expect(
            isSortedArray(
                [0, 1, 2, 3, 4, 5]
            )
        ).toBe(true)
    })

    it('returns false if the given array is not sorted', () => {
        expect(
            isSortedArray(
                [5, 1, 7, 3, 0]
            )
        ).toBe(false)
    })

    it('returns true on arrays with consecutive same values', () => {
        expect(
            isSortedArray(
                [1, 1, 2, 3, 4, 5]
            )
        ).toBe(true)
    })

    it('works on descending-sorted arrays', () => {
        expect(
            isSortedArray(
                [5, 4, 3, 2, 1, 0]
            )
        ).toBe(true)
    })

    describe('isAscending argument', () => {
        it('if false, requires given value is ascending sorted', () => {
            expect(
                isSortedArray(
                    [0, 1, 2, 3, 4, 5],
                    true
                )
            ).toBe(true)

            expect(
                isSortedArray(
                    [3, 2, 1, 0],
                    true
                )
            ).toBe(false)
        })

        it('if false, requires given value is descending sorted', () => {
            expect(
                isSortedArray(
                    [0, 1, 2, 3, 4, 5],
                    false
                )
            ).toBe(false)

            expect(
                isSortedArray(
                    [3, 2, 1, 0],
                    false
                )
            ).toBe(true)
        })
    })
})