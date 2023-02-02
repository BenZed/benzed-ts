import InstanceValidator from '../instance-validator'

//// Exports ////

export class ErrorValidator extends InstanceValidator<DateConstructor> {
    constructor() {
        super(Error)
    }
}