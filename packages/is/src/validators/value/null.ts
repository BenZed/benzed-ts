
import Value from './value'

//// Main ////
export interface Null extends Value<null> {}
export const $null: Null = new Value(null)