import { Primitive, isDefined as _isDefined } from '@benzed/util'
import { ChainableSchematic } from '../chainable'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Setup ////

class IsDefined<T extends Primitive> extends ChainableSchematic<T> {

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