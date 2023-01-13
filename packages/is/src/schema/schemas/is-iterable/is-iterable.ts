import { isIterable as _isIterable } from '@benzed/util'
import ChainableSchema from '../chainable'

//// Main ////

class IsIterable<T> extends ChainableSchema<Iterable<T>> {

    constructor() {
        super({
            is: _isIterable,
            error: 'must be iterable'
        })
    }

}

//// Exports ////

export default IsIterable

export {
    IsIterable
}

export const isIterable = new IsIterable