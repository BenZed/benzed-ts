import InstanceValidator from '../instance-validator'

//// Exports ////

export class WeakMapValidator extends InstanceValidator<WeakMapConstructor> {
    constructor() {
        super(WeakMap)
    }
}