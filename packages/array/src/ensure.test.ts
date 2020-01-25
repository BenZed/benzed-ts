import ensure from './ensure'

/***************************************************************/
// Tests
/***************************************************************/

it('ensures a value is in an array', () => {
    expect(ensure([1], 2)).toEqual([1, 2])
})

it('does nothing if value is in array', () => {
    expect(ensure([1], 1)).toEqual([1])
})

