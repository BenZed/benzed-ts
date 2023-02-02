import InstanceValidator from '../instance-validator'

//// Exports ////

export class PromiseValidator extends InstanceValidator<PromiseConstructor> {
    constructor() {
        super(Promise)
    }
}