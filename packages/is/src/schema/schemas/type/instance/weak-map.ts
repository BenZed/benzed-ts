import Instance from './instance'

//// Exports ////

export interface WeakMap extends Instance<WeakMapConstructor> {}
export const isWeakMap: WeakMap = new Instance(WeakMap)