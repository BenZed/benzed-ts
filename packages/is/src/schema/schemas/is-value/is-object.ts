import { isFunc, isObject as _isObject } from '@benzed/util'
import { ChainableSchematic } from '../chainable'

//// Exports ////

class IsObject extends ChainableSchematic<object> {

    constructor() {
        super({
            is: (i: unknown): i is object => _isObject(i) || isFunc(i),
            error: 'must be an object'
        })
    }

}

//// Exports ////

export default IsObject

export {
    IsObject
}

export const isObject = new IsObject