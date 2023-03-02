import clamp from './clamp'

import { it, expect, describe } from '@jest/globals'

//// Tests ////

describe('clamp()', () => {

    it('clamps $num between $min and $max: \t\tclamp(5,2,4) === 4', () => {
        expect(clamp(5, 2, 4)).toEqual(4)
    })

    it('clamps between 0 and 1 by default: \t\tclamp(-1) === 0', () => {
        expect(clamp(-1)).toEqual(0)
    })

    it('bound values transfer defaults properly: \tclamp(2) === 1', () => {
        expect(clamp(2)).toEqual(1)
    })

})
