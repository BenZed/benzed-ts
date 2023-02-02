import InstanceValidator from '../instance-validator'

//// Exports ////

export class RegExpValidator extends InstanceValidator<RegExpConstructor> {
    constructor() {
        super(RegExp)
    }
}