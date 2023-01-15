import { isFunc, isObject as _isObject } from '@benzed/util'
import Type from './type'

//// Exports ////

class Object extends Type<object> {

    constructor() {
        super({
            name: 'object',
            is: (i: unknown): i is object => _isObject(i) || isFunc(i),
            error: 'must be an object'
        })
    }

}

//// Exports ////

export default Object

export {
    Object
}

export const isObject = new Object