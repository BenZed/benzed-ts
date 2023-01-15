import { Primitive, isDefined as _isDefined, nil } from '@benzed/util'
import Schema from '../../schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Setup ////

type Defined = Exclude<Primitive, nil | null> | object

class Defined extends Schema<Defined> {

    constructor() {
        super({
            is: _isDefined,
            error: 'Must be defined'
        })
    }
}

//// Exports ////

export default Defined

export {
    Defined
}

export const isDefined = new Defined