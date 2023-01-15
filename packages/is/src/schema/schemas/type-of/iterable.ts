import { isIterable as _isIterable, TypeOf } from '@benzed/util'

import { isUnknown } from '../type'
import { IsTypeOf, AnyTypeGuard } from './type-of'

//// Main ////

class IsIterable<O extends AnyTypeGuard> extends IsTypeOf<O, Iterable<TypeOf<O>>> {

    constructor(of: O) {
        super({
            of,
            name: 'iterable',
            is(i: unknown): i is Iterable<TypeOf<O>> {
                if (!_isIterable(i))
                    return false
                
                if (this.of !== isUnknown as AnyTypeGuard) {
                    for (const item of i) {
                        if (!this.of(item))
                            return false
                    }
                } 
                return true
            }
        })
    }
}

//// Exports ////

export default IsIterable

export {
    IsIterable,
}

export const isIterable = new IsIterable(isUnknown)