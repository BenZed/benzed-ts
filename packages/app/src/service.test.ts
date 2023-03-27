
import { Stateful, Structural } from '@benzed/immutable'
import { pick } from '@benzed/util'

import { Service } from './service'
import Module from './module'

import { test, expect } from '@jest/globals'

//// Tests ////

class DummyModule extends Module {

    readonly state: number = 0

    get [Structural.state](): { state: number } {
        return pick(this, 'state')
    }

}

const dummyService = new class DummyService extends Service {

    readonly module = new DummyModule

}

test('state', () => {

    expect(
        Stateful.get(dummyService)
    ).toEqual({
        module: { state: 0 }
    })

})