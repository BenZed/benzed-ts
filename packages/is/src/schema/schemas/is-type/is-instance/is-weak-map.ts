import IsInstance from './is-instance'

//// Exports ////

export class IsWeakMap extends IsInstance<WeakMapConstructor> {
    constructor() {
        super(WeakMap)
    }
}

export const isWeakMap = new IsWeakMap