import { Instance } from './instance'//// Exports ////

//// Exports ////

export class WeakMap extends Instance<WeakMapConstructor> {
    constructor() {
        super(globalThis.WeakMap)
    }
}

export const $weakmap = new WeakMap