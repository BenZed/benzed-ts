import { Primitive as Primitives, isPrimitive as _isPrimitive } from '@benzed/util'

import Type from './type'

//// Exports ////

export interface Primitive extends Type<Primitives> {}
export const isPrimitive: Primitive = new Type({ name: 'unknown', is: _isPrimitive })