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

            is(input: unknown): input is _Iterable<OutputType<O>> {
                if (!_isIterable(input))
                    return false

                for (const item of input) {
                    if (!this.of(item))
                        return false
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