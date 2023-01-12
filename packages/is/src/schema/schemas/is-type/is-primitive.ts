import { Primitive, isPrimitive as _isPrimitive } from '@benzed/util'

import IsType from './is-type'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Setup ////

class IsPrimitive extends IsType<Primitive> {

    constructor() {
        super({
            type: 'primitive',
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