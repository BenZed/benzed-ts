import includes from './includes'

describe(`value-equal includes()`, () => {

    it(`returns true if an arraylike has an item`, () => {
        const arr = [0, 1, 2, 3, 4, 5]
        return expect(includes(arr, 3)).toBe(true)
    })

    it(`works on value-equal objects`, () => {
        const arr = [{ foo: `bar` }, { cake: `town` }]
        return expect(includes(arr, { cake: `town` })).toBe(true)
    })

    it(`works on any arraylike`, () => {

        const arrlike = {
            length: 2,
            0: { foo: `bar` },
            1: { cake: `town` },
            2: { you: `suck, jimmy` }
        }

        return expect(includes(arrlike, { cake: `town` })).toBe(true)
    })

})