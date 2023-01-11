import IsInstance from './is-instance'

//// Exports ////

export class IsWeakSet extends IsInstance<WeakSetConstructor> {
    constructor() {
        super(WeakSet)
    }
}

export const isWeakSet = new IsWeakSet