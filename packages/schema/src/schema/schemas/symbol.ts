
import { isSymbol } from '@benzed/util'

import { 
    Schema
} from '../schema'

import { 
    Type,
    defaultTypeSettings, 
} from './type'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Symbol Schema Type ////

interface Symbol extends Type<symbol> { }

//// Symbol Schema Implementation ////

export default new Schema({

    ...defaultTypeSettings,

    name: 'symbol',

    isValid: isSymbol,

}) as Symbol

//// Exports ////

export {
    Symbol
}