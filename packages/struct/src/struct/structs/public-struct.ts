import { KeysOf, omit } from '@benzed/util'

import { $$state } from '../../state'

import Struct from '../struct'

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
    Pick<T, Exclude<KeysOf<T>, 'toString' | 'valueOf'>>

/**
 * In a public struct any property is considered state, so long as it isn't an object 
 * prototype property.
 */
export abstract class PublicStruct extends Struct {

    get [$$state](): PublicState<this> {
        return omit(this, 'toString', 'valueOf') as PublicState<this>
    }

}
