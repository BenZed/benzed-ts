import { remove } from './remove'
import { it, expect } from '@jest/globals'
//// Main ////

it('removes all values from an array', () => {
    expect(remove([1, 2, 3], 1)).toEqual([2, 3])
})

it('optionally bindable', () => {

    const arrayLike = {
        length: 3,
        0: 'ace',
        1: 'base',
        2: 'case',
        remove
    }

    arrayLike.remove('case')
    expect(arrayLike).toHaveLength(2)

})