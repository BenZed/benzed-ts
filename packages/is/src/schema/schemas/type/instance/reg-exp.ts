import Instance from './instance'

//// Types ////

const RegExpConstructor = globalThis.RegExp

//// Exports ////

export interface RegExp extends Instance<RegExpConstructor> {}
export const isRegExp: RegExp = new Instance(RegExpConstructor)