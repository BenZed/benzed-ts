import { Func, isFunc } from '@benzed/util'
import ChainableSchema from '../chainable'

//// Exports ////

class IsFunction extends ChainableSchema<Func> {

    constructor() {
        super({
            is: isFunc,
            error: 'must be a function'
        })
    }

}

//// Exports ////

export default IsFunction

export {
    IsFunction
}

export const isFunction = new IsFunction