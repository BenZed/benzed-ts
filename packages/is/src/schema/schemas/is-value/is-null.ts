
import IsValue from './is-value'

//// Main ////
export interface IsNull extends IsValue<null> {}
export const isNull: IsNull = new IsValue(null)