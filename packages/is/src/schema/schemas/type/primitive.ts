import { Primitive as Primitives, isPrimitive as _isPrimitive } from '@benzed/util'

import Type from './type'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Setup ////

class Primitive extends Type<Primitives> {

    constructor() {
        super({
            name: 'primitive',
            is: _isPrimitive
        })
    }

}

//// Exports ////

export default Primitive

export {
    Primitive
}

export const isPrimitive = new Primitive