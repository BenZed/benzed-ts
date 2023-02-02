import { ValueValidator } from '@benzed/schema'

//// Exports ////

export class UndefinedValidator extends ValueValidator<undefined> {

    constructor(force: boolean) {
        super(undefined, force)
    }

}