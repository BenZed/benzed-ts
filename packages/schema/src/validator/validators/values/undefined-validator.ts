import { ValueValidator } from '../value-validator'

//// Exports ////

export class UndefinedValidator extends ValueValidator<undefined> {

    constructor() {
        super(undefined)
    }

}