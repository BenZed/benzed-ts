import { Func, isFunc } from '@benzed/util'
import IsType from './is-type'

//// Exports ////

class IsFunction extends IsType<Func> {

    constructor() {
        super({
            name: 'function',
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