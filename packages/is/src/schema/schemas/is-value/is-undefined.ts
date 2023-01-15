
import IsValue from './is-value'

//// Main ////
export interface IsUndefined extends IsValue<undefined> {}
export const isUndefined: IsUndefined = new IsValue(undefined)