import { KeysOf, omit } from '@benzed/util'

import Struct from '../struct'

import { copy } from '../../../copy'
import { equals } from '../../../equals'

import { $$state, applyDeepState, applyState, StateApply, SubStateApply } from '../../state'

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
    Exclude<KeysOf<T>, 'toString' | 'valueOf' | 'apply' | 'applyIn' | 'copy' | 'equal'>
    >

/**
 * A public struct has public 
 */
export abstract class PublicStruct extends Struct {

    apply(state: StateApply<this>): this {
        return applyState(this, state)
    }

    applyIn(...state: SubStateApply<this>): this {
        return applyDeepState(this, ...state)
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
            'apply',
            'applyIn',
            'copy',
            'equal'
        ) as PublicState<this>
    }

}
