import IsInstance from './is-instance'

//// Exports ////

export interface IsWeakMap extends IsInstance<WeakMapConstructor> {}
export const isWeakMap: IsWeakMap = new IsInstance(WeakMap)