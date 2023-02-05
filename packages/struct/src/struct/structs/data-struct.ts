import { Func, isFunc, keysOf, KeysOf } from '@benzed/util'

import { AnyState, $$state } from '../../state'
import Struct from '../struct'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// DataState ////

/**
 * State preset for generic data objects.
 * Any property that isn't a method is considered state.
 */
export type DataState<T extends AnyState> = {
    [K in KeysOf<T> as T[K] extends Func ? never : K]: T[K]
}

export abstract class DataStruct extends Struct {

    get [$$state](): DataState<this> {

        const state = {} as DataState<this>

        for (const key of keysOf(this)) {
            if (!isFunc(this[key]))
                (state as any)[key] = this[key]
        }

        return state
    }

}