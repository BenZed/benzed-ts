import { Primitive } from '@benzed/util'

import IsType from './is-type'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Setup ////

abstract class IsPrimitive<T extends Primitive> extends IsType<T> {}

//// Exports ////

export default IsPrimitive

export {
    IsPrimitive
}