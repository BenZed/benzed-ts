import { InstanceValidator } from '@benzed/schema'

//// Exports ////

export class ErrorValidator extends InstanceValidator<ErrorConstructor> {
    constructor() {
        super(Error)
    }
}