import InstanceValidator from '../instance-validator'

//// Exports ////

export class WeakSetValidator extends InstanceValidator<WeakSetConstructor> {
    constructor() {
        super(WeakSet)
    }
}