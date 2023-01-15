import IsInstance from './instance'

//// Exports ////

export interface IsWeakSet extends IsInstance<WeakSetConstructor> {}
export const IsWeakSet: IsWeakSet = new IsInstance(WeakSet)