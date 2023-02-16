import { State } from './state'

import { pick, Trait } from '@benzed/util'

//// Tests ////

class Vector extends Trait.use(State) {
    
    constructor(readonly x = 0, readonly y = 0) {
        super()
    }

    get [State.state](): Pick<this, 'x' | 'y'> {
        return pick(this, 'x', 'y')
    }

    override [State.copy](): this {
        const copy = super[State.copy]()
        return copy
    }

}

