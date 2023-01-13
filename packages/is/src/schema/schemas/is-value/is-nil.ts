import { Primitive, asNil, isNil as _isNil } from '@benzed/util'
import { ChainableSchematic } from '../chainable'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Setup ////

class IsNil<T extends Primitive> extends ChainableSchematic<T> {

    constructor() {
        super({
            is: _isNil,
            transform: asNil,
            error: () => 'Must be nil'
        })
    }
}

//// Exports ////

export default IsNil

export {
    IsNil
}

export const isNil = new IsNil