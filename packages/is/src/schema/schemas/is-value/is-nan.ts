import IsValue from './is-value'

//// Exports ////

export interface IsNaN extends IsValue<number> {}
export const isNaN: IsNaN = new IsValue(NaN)