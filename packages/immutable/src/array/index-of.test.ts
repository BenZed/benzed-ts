import indexOf from './index-of'

/* eslint-disable @typescript-eslint/no-explicit-any */

describe(`value-equal indexOf()`, () => {

    it(`returns the index of a primitive in an array`, () => {
        const arr = [0, 1, 2, 3, 4, 5, 6]
        expect(indexOf(arr, 6)).toEqual(6)
    })

    it(`returns the index of a value-equal object in an array`, () => {
        const arr = [{ foo: `bar` }, { cake: `town` }]
        expect(indexOf(arr, { cake: `town` })).toEqual(1)
    })

    it(`works on array-likes`, () => {
        const arrlike = {
            length: 2,
            0: { foo: `bar` },
            1: { cake: `town` },
            2: { you: `suck, jimmy` }
        }
        expect(indexOf(arrlike, { cake: `town` })).toEqual(1)
    })

})