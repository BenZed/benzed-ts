
import { isSymbol as _isSymbol } from '@benzed/util'

import Type from './type'

/* eslint-disable 
    @typescript-eslint/ban-types
*/

//// Exports ////

export interface Symbol extends Type<symbol> {}
export const isSymbol: Symbol = new Type({ name: 'symbol', is: _isSymbol })