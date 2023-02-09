import { NamesOf, omit } from '@benzed/util'

import Struct from '../struct'

import { copy } from '../copy'
import { equals } from '../equals'

import { 
    $$state, 
    applyState,
    SubStatePath, 
    State,
    getState,
    StateApply
} from '../state'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/ 

//// PublicStruct ////

/**
 * State preset for a generic objects.
 * Any property is considered state, so long as it isn't an object prototype property.
 */
export type PublicState<T extends object> = 
    Pick<
    T,
    Exclude<NamesOf<T>, 'toString' | 'valueOf' | 'copy' | 'equal' | 'get' | 'set'>
    >

/**
 * A public struct has public 
 */
export abstract class PublicStruct extends Struct {

    set<P extends SubStatePath>(...pathAndState: [...path: P, state: StateApply<this, P>]): this {
        return applyState(this, ...pathAndState)
    }

    get<P extends SubStatePath>(...path: P): State<this, P> {
        return getState(this, ...path)
    }

    copy(): this {
        return copy(this)
    }

    equal(other: unknown): other is this {
        return equals(this, other)
    }

    get [$$state](): PublicState<this> {
        return omit(
            this, 
            'toString', 
            'valueOf',
            'get',
            'set',
            'copy',
            'equal'
        ) as PublicState<this>
    }

}
