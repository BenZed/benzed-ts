import InstanceValidator from '../instance-validator'

//// Exports ////

export class ErrorValidator extends InstanceValidator<ErrorConstructor> {
    constructor() {
        super(Error)
    }
}