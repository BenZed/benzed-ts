import { ValueValidator } from '@benzed/schema'

//// Exports ////

export class NaNValidator extends ValueValidator<number> {

    constructor(force: boolean) {
        super(NaN, force)
    }

}