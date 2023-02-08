import { Instance } from './instance'

//// Exports ////

export class RegExp extends Instance<RegExpConstructor> {
    constructor() {
        super(globalThis.RegExp)
    }
}

export const $regexp = new RegExp