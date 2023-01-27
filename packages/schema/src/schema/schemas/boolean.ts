
import { isBoolean } from '@benzed/util'

import { 
    Schema
} from '../schema'

import { 
    Cast, 
    Type,
    defaultTypeSettings, 
} from './type'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Boolean Validation Defaults ////

const castToBoolean: Cast = (i) => {
    
    if (i === 'true' || i === 1 || i === BigInt(1))
        return true 

    if (i === 'false' || i === 0 || i === BigInt(0))
        return false

    return i
}

//// Boolean Schema Type ////

interface Boolean extends Type<boolean> { }

//// Boolean Schema Implementation ////

export default new Schema({

    ...defaultTypeSettings,

    name: 'boolean',

    isValid: isBoolean,
    cast: castToBoolean,

}) as Boolean

//// Exports ////

export {
    Boolean
}