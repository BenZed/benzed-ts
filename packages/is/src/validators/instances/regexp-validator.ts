import { InstanceValidator } from '@benzed/schema'

//// Exports ////

export class RegExpValidator extends InstanceValidator<RegExpConstructor> {
    constructor() {
        super(RegExp)
    }
}