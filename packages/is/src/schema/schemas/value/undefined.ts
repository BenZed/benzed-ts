
import Value from './value'

//// Main ////
export interface Undefined extends Value<undefined> {}
export const isUndefined: Undefined = new Value(undefined)