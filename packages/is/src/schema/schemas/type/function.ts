import { Func, isFunc } from '@benzed/util'
import Type from './type'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Exports ////

export interface Function extends Type<Func> {}
export const isFunction: Function = new Type({ 
    name: 'function', 
    is: isFunc
})