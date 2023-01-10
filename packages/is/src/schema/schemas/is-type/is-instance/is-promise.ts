import IsInstance from './is-instance'

//// Exports ////

export class IsPromise extends IsInstance<PromiseConstructor> {
    constructor() {
        super(Promise)
    }
}

