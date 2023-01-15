import IsInstance from './is-instance'

//// Exports ////

export interface IsWeakSet extends IsInstance<WeakSetConstructor> {}
export const IsWeakSet: IsWeakSet = new IsInstance(WeakSet)