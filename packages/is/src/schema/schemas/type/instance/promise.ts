import IsInstance from './instance'

//// Exports ////

export interface IsPromise extends IsInstance<PromiseConstructor> {}
export const isPromise: IsPromise = new IsInstance(Promise)