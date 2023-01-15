import IsInstance from './instance'

//// Exports ////

export interface IsRegExp extends IsInstance<RegExpConstructor> {}
export const isRegExp: IsRegExp = new IsInstance(RegExp)