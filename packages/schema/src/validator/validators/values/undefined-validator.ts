import { ValueValidator } from '../value-validator'

//// Exports ////

export class UndefinedValidator extends ValueValidator<undefined> {

    constructor(force: boolean) {
        super(undefined, force)
    }

}