import { ValueValidator } from '../value-validator'

//// Exports ////

export class NullValidator extends ValueValidator<null> {

    constructor() {
        super(null)
    }

}