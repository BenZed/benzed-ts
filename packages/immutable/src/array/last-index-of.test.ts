import lastIndexOf from './last-index-of'

describe('value-equal lastIndexOf', () => {

    it('returns the last index of a value', () => {
        const arr = [0, 1, 1, 2]
        return expect(lastIndexOf(arr, 1)).toEqual(2)
    })

    it('works on value equal objects', () => {
        const arr = [{ foo: 'bar' }, { cake: 'town' }, { cake: 'town' }, { a: 'b' }]
        expect(lastIndexOf(arr, { cake: 'town' })).toEqual(2)
    })

    it('works on any arraylike', () => {
        const arrlike = {
            length: 3,
            0: { foo: 'bar' },
            1: { cake: 'town' },
            2: { cake: 'town' },
            3: { you: 'suck, jimmy' }
        }
        return expect(lastIndexOf(arrlike, { cake: 'town' })).toEqual(2)
    })

})
