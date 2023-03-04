import { lazy } from './lazy'

import { it, expect } from '@jest/globals'

//// Tests ////

class Contrived {

    get scores(): number[] {
        return lazy(this, 'scores', () => [1,2,3,4])
    }

}

it('gets values', () => {
    const contrived = new Contrived()
    expect(contrived.scores).toEqual([1,2,3,4])
}) 