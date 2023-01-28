
import Value from './value'

//// Main ////
export interface Null extends Value<null> {}
export const isNull: Null = new Value(null)