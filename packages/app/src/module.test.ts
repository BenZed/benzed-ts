import { Module } from './module'

import { describe, test, it, expect } from '@jest/globals'
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

describe('static trait shortcuts', () => {

    test.todo('use')

    test.todo('add')

    test.todo('getState')

    test.todo('setState')

    test.todo('applyState')

    test.todo('state')

    test.todo('copy')

    test.todo('equals')

})

describe('static methods', () => {

    test.todo('nameOf')

})

describe('methods & properties', () => {

    test.todo('name')

    test.todo('parent')

    test.todo('root')

    test.todo('modules')

    test.todo('find')

    test.todo('has')

    test.todo('assert')

    test.todo('client')

    test.todo('server')

})

describe('trait behaviours', () => {

    it.todo('applies Node on copy')

    it.todo('enumerable properties as state')

    it.todo('instanceof works on callable modules')

})
