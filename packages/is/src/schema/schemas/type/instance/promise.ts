import Instance from './instance'

//// Types ////

const PromiseConstructor = globalThis.Promise

//// Exports ////

export interface Promise extends Instance<PromiseConstructor> {}
export const isPromise: Promise = new Instance(PromiseConstructor)