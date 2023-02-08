import { Instance } from './instance'

//// Exports ////

export class ErrorValidator extends Instance<ErrorConstructor> {
    constructor() {
        super(Error)
    }
}