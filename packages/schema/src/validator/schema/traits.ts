import { Structural } from '@benzed/immutable'

import { AnyTypeGuard, assign, isBoolean, isIntersection, isShape, pick } from '@benzed/util'

//// Main ////

abstract class Enableable extends Structural {

    static override readonly is: (input: unknown) => input is Enableable = isIntersection(
        Structural.is,
        isShape({
            enabled: isBoolean
        }) as AnyTypeGuard
    )

    abstract readonly enabled: boolean 

    get [Structural.state](): Pick<this, 'enabled'> {
        return pick(this, 'enabled')
    }

    set [Structural.state](state: Pick<this, 'enabled'>) {
        assign(this, state)
    }

}

//// Exports ////

