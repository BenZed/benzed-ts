import { 
    isArray as _isArray, 
    isString as _isString, 
    safeJsonParse, 
    TypeOf
} from '@benzed/util'

import { 
    IsUnknown, 
    isUnknown,
} from '../../type'
import { AnyTypeGuard, IsTypeOf } from '../type-of'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type IsArrayInput = AnyTypeGuard

class IsArrayOf<T extends IsArrayInput> extends IsTypeOf<T, TypeOf<T>[]> {

    constructor(of: T) {

        type O = TypeOf<T>[]

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

export default IsArrayOf

export {
    IsArrayOf
}

export interface IsArray extends IsArrayOf<IsUnknown> {}
export const isArray: IsArray = new IsArrayOf(isUnknown)