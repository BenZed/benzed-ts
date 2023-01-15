import Instance from './instance'

//// Exports ////

export interface WeakSet extends Instance<WeakSetConstructor> {}
export const WeakSet: WeakSet = new Instance(WeakSet)