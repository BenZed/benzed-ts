import { asNil, isNil as _isNil, nil } from '@benzed/util'
import Schematic from '../../schematic'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Setup ////

class IsNil extends Schematic<nil> {

    constructor() {
        super({
            is: _isNil,
            transform: asNil,
            error: 'Must be nil'
        })
    }
}

//// Exports ////

export default IsNil

export {
    IsNil
}

export const isNil = new IsNil