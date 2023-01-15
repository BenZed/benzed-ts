import IsInstance from './instance'

//// Exports ////

export interface IsDate extends IsInstance<DateConstructor> {}
export const isDate: IsDate = new IsInstance(Date)