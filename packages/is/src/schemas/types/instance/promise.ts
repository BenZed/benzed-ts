import { Instance } from './instance'

//// Exports ////

export class Promise extends Instance<PromiseConstructor> {
    constructor() {
        super(globalThis.Promise)
    }
}

export const $promise = new Promise