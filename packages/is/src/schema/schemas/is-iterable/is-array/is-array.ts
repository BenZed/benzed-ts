import { 
    isArray as _isArray, 
    isString as _isString, 
    safeJsonParse, 
    TypeGuard, 
    TypeOf
} from '@benzed/util'

import { 
    IsType, 
    IsUnknown, 
} from '../../is-type'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type IsArrayInput = TypeGuard<unknown>

class IsArray<T extends IsArrayInput = IsUnknown> extends IsType<TypeOf<T>[]> {

    /**
     * @internal
     */
    constructor()
    constructor(item: T)
    constructor(readonly item?: T) {
        type O = TypeOf<T>[]

        super({
            type: 'array',

            is: (i: unknown): i is O =>
                _isArray(i, this.item),

            cast: (i: unknown): unknown =>
                _isString(i) 
                    ? safeJsonParse(i, this.is) 
                    : i
        })
    }
}

//// Exports ////

export default IsArray

export {
    IsArray
}

export const isArray = new IsArray