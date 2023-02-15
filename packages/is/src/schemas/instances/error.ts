import { Instance } from './instance'

//// Main ////

class Error extends Instance<ErrorConstructor> {

    constructor() {
        super(globalThis.Error)
    }

}

//// Exports ////

export { Error }

export const $error = new Error