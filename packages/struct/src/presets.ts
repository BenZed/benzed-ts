import { Func, isFunc, keysOf, KeysOf, omit } from '@benzed/util'

import { State, $$state } from './state'
import Struct from './struct'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// PublicStruct ////

/**
 * State preset for a generic objects.
 * Any property is considered state, so long as it isn't an object prototype property.
 */
export type PublicState<T extends State> = Pick<T, Exclude<KeysOf<T>, 'toString' | 'valueOf'>>

/**
 * In a public struct any property is considered state, so long as it isn't an object 
 * prototype property.
 */
export abstract class PublicStruct extends Struct {
    get [$$state](): PublicState<this> {
        return omit(this, 'toString', 'valueOf') as PublicState<this>
    }
}

//// DataState ////

/**
 * State preset for generic data objects.
 * Any property that isn't a method is considered state.
 */
export type DataState<T extends State> = {
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