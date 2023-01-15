import Instance from './instance'

//// Exports ////

export interface RegExp extends Instance<RegExpConstructor> {}
export const isRegExp: RegExp = new Instance(RegExp)