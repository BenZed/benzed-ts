import { Func, isFunc, namesOf, NamesOf } from '@benzed/util'

import { $$state } from '../state'

import { Struct } from '../struct'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// DataState ////

/**
 * State preset for generic data objects.
 * Any property that isn't a method is considered state.
 */
export type DataState<T extends Struct> = {
    [K in NamesOf<T> as T[K] extends Func ? never : K]: T[K]
}

export abstract class DataStruct extends Struct {

    get [$$state](): DataState<this> {

        const state = {} as DataState<this>

        for (const name of namesOf(this)) {
            if (!isFunc(this[name]))
                (state as any)[name] = this[name]
        }

        return state
    }

}