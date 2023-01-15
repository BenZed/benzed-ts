import { Primitive, isPrimitive as _isPrimitive } from '@benzed/util'

import IsType from './type'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Setup ////

class IsPrimitive extends IsType<Primitive> {

    constructor() {
        super({
            name: 'primitive',
            is: _isPrimitive
        })
    }

}

//// Exports ////

export default IsPrimitive

export {
    IsPrimitive
}

export const isPrimitive = new IsPrimitive