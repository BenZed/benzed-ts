import { isFunc, isObject as _isObject } from '@benzed/util'
import Type from './type'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Exports ////

export interface Object extends Type<object> {}
export const isObject: Object = new Type({ 
    name: 'object', 
    is: (i: unknown): i is object => _isObject(i) || isFunc(i) 
})