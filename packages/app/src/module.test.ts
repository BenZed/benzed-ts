import { Module } from './module'

import { test, expect } from '@jest/globals'
import { Structural } from '@benzed/immutable'
import { pick } from '@benzed/util'
import is from '@benzed/is'

////  ////

class Value extends Module {

    state = 0

    get [Structural.state](): Pick<this, 'state'> {
        return pick(this, 'state')
    }
}

//// Tests ////

test.todo('module')