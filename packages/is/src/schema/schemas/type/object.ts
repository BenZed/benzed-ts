import { isFunc, isObject as _isObject } from '@benzed/util'
import Type from './type'

//// Exports ////

class AnyObject extends Type<object> {

    constructor() {
        super({
            name: 'object',
            is: (i: unknown): i is object => _isObject(i) || isFunc(i),
            error: 'must be any object'
        })
    }

}

//// Exports ////

export default AnyObject

export {
    AnyObject
}

export const isObject = new AnyObject