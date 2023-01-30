
import Value from './value'

//// Main ////
export interface Undefined extends Value<undefined> {}
export const $undefined: Undefined = new Value(undefined)