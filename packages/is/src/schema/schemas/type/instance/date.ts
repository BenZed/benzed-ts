import Instance from './instance'

//// Exports ////

export interface Date extends Instance<DateConstructor> {}
export const isDate: Date = new Instance(Date)