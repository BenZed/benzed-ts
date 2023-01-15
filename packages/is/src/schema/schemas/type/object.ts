import { isFunc, isObject as _isObject } from '@benzed/util'
import IsType from './type'

//// Exports ////

class IsObject extends IsType<object> {

    constructor() {
        super({
            name: 'object',
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