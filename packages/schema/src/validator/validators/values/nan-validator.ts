import { ValueValidator } from '../value-validator'

//// Exports ////

export class NaNValidator extends ValueValidator<number> {

    constructor() {
        super(NaN)
    }

}