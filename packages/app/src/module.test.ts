import { Module } from './module'

import { test, it, expect, describe } from '@jest/globals'
import { Structural } from '@benzed/immutable'
import { pick } from '@benzed/util'

////  ////

class Value extends Module {

    state = 0

    get [Structural.state](): Pick<this, 'state'> {
        return pick(this, 'state')
    }
}

//// Tests ////

test('Module.is', () => {

    const value = new Value()

    expect(Module.is(value)).toBe(true)

})