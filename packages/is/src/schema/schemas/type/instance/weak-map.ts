import Instance from './instance'

//// Types ////

const WeakMapConstructor = globalThis.WeakMap

//// Exports ////

export interface WeakMap extends Instance<WeakMapConstructor> {}
export const isWeakMap: WeakMap = new Instance(WeakMapConstructor)