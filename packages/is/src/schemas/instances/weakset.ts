import { Instance } from './instance'

//// Exports ////

export class WeakSet extends Instance<WeakSetConstructor> {
    constructor() {
        super(globalThis.WeakSet)
    }
}

export const $weakset = new WeakSet