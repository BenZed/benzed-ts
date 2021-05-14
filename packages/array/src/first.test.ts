import first from './first'

/*** Tests ***/

it('returns the first element of an array', () => {
    expect(first([1, 2, 3, 4, 5])).toEqual(1)
})

it('works on array-likes', () => {
    expect(first('string')).toEqual('s')
    expect(first({ 0: 'zero', length: 1 })).toEqual('zero')
})