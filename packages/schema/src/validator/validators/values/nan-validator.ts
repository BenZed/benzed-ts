import { ValueValidator } from '../value-validator'

//// Exports ////

export class NaNValidator extends ValueValidator<number> {

    constructor(force: boolean) {
        super(NaN, force)
    }

}