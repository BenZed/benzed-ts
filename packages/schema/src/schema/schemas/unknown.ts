
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

//// Unknown Schema Type ////

interface Unknown extends Type<unknown> { }

//// Unknown Schema Implementation ////

export default new Schema(defaultTypeSettings) as Unknown

//// Exports ////

export {
    Unknown
}