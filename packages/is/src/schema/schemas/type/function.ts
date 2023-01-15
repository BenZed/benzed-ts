import { Func, isFunc } from '@benzed/util'
import Type from './type'

//// Exports ////

class Function extends Type<Func> {

    constructor() {
        super({
            name: 'function',
            is: isFunc,
            error: 'must be a function'
        })
    }

}

//// Exports ////

export default Function

export {
    Function
}

export const isFunction = new Function