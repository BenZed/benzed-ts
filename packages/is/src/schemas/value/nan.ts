import Value from './value'

//// Exports ////

export interface NaN extends Value<number> {}
export const $nan: NaN = new Value(NaN)