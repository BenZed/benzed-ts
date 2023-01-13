import { Primitive, isDefined as _isDefined, nil } from '@benzed/util'
import { ChainableSchema } from '../chainable'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Setup ////

type Defined = Exclude<Primitive, nil | null> | object

class IsDefined extends ChainableSchema<Defined> {

    constructor() {
        super({
            is: _isDefined,
            error: 'Must be defined'
        })
    }
}

//// Exports ////

export default IsDefined

export {
    IsDefined
}

export const isDefined = new IsDefined