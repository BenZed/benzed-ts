import { isIterable as _isIterable, TypeOf as OutputType } from '@benzed/util'

import { isUnknown, Unknown } from '../type'

import { TypeOf, AnyTypeGuard } from './type-of'

//// Helper Types ////

/**
 * @internal
 */
interface _Iterable<T> {
    [Symbol.iterator](): Iterator<T>
}

//// Main ////

class IterableOf<O extends AnyTypeGuard> extends TypeOf<O, _Iterable<OutputType<O>>> {

    constructor(of: O) {
        super({
            of,
            name: 'iterable',
            is(i: unknown): i is _Iterable<OutputType<O>> {
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

export default IterableOf

export {
    IterableOf,
}

export interface Iterable extends IterableOf<Unknown> {}
export const isIterable: Iterable = new IterableOf(isUnknown)