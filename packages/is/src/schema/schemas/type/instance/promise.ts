import Instance from './instance'

//// Exports ////

export interface Promise extends Instance<PromiseConstructor> {}
export const isPromise: Promise = new Instance(Promise)