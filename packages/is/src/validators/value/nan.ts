import Value from './value'

//// Exports ////

export interface NaN extends Value<number> {}
export const isNaN: NaN = new Value(NaN)