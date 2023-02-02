import { ValueValidator } from '@benzed/schema'

//// Exports ////

export class NullValidator extends ValueValidator<null> {

    constructor(force: boolean) {
        super(null, force)
    }

}