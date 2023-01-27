
import { isPrimitive, Primitive as Primitives } from '@benzed/util'

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

//// Primitive Schema Type ////

interface Primitive extends Type<Primitives> { }

//// Primitive Schema Implementation ////

export default new Schema({

    ...defaultTypeSettings,

    name: 'primitive',

    isValid: isPrimitive

}) as Primitive

//// Exports ////

export {
    Primitive
}