import { asNil, isNil as _isNil, nil } from '@benzed/util'
import Schematic from '../../schematic'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Setup ////

class Nil extends Schematic<nil> {

    constructor() {
        super({
            is: _isNil,
            transform: asNil,
            error: 'Must be nil'
        })
    }
}

//// Exports ////

export default Nil

export {
    Nil
}

export const isNil = new Nil