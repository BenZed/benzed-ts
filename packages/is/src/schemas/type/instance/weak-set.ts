import Instance from './instance'

//// Types ////

const WeakSetConstructor = globalThis.WeakSet

//// Exports ////

export interface WeakSet extends Instance<WeakSetConstructor> {}
export const isWeakSet: WeakSet = new Instance(WeakSetConstructor)