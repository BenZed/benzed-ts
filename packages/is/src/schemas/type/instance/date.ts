import Instance from './instance'

//// Types ////

const DateConstructor = globalThis.Date

//// Exports ////

export interface Date extends Instance<DateConstructor> {}
export const isDate: Date = new Instance(DateConstructor)