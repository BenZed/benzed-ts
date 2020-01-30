import remove from './remove'

/***************************************************************/
// Main
/***************************************************************/

it('removes all values from an array', () => {
  expect(remove([1, 2, 3], 1)).toEqual([2, 3])
})
