import Instance from './instance'

//// Types ////

const ErrorConstructor = globalThis.Error

//// Exports ////

export class Error extends Instance<ErrorConstructor> {
    constructor() {
        super(ErrorConstructor)
    }
}

export const isError = new Error