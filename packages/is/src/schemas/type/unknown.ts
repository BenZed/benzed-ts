import { isUnknown as _isUnknown } from '@benzed/util'

import Type from './type'

//// Exports ////

export interface Unknown extends Type<unknown> {}
export const isUnknown: Unknown = new Type({ name: 'unknown', is: _isUnknown })