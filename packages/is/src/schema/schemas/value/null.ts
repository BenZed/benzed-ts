
import IsValue from './value'

//// Main ////
export interface IsNull extends IsValue<null> {}
export const isNull: IsNull = new IsValue(null)