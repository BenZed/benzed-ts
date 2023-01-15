import { 
    isArray as _isArray, 
    isString as _isString, 
    safeJsonParse, 
    TypeOf as OutputTypeOf
} from '@benzed/util'

import { 
    Unknown, 
    isUnknown,
} from '../type'
import { AnyTypeGuard, TypeOf } from './type-of'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type ArrayInput = AnyTypeGuard

class ArrayOf<T extends ArrayInput> extends TypeOf<T, OutputTypeOf<T>[]> {

    constructor(of: T) {

        type O = OutputTypeOf<T>[]

        super({

            of,

            name: 'array',

            is(i: unknown): i is O {
                return _isArray(i, this.of)
            },

            cast(i: unknown): unknown {
                return _isString(i) 
                    ? safeJsonParse(i, (i): i is O => 
                        this.is(i, { input: i, transform: false, path: []})) 
                    : i
            }
        })
    }
}

//// Exports ////

export default ArrayOf

export {
    ArrayOf
}

export interface Array extends ArrayOf<Unknown> {}
export const isArray: Array = new ArrayOf(isUnknown)