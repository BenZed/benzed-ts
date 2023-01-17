import { Primitive, isDefined as _isDefined, nil } from '@benzed/util'
import Type from './type'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Setup ////

type defined = Exclude<Primitive, nil | null> | object

//// Exports ////

export interface Defined extends Type<defined> {}
export const isDefined: Defined = new Type({ 
    name: 'defined', 
    is: (i: unknown): i is defined => _isDefined(i)
})