import { InstanceValidator } from '@benzed/schema'
//// Exports ////

export class PromiseValidator extends InstanceValidator<PromiseConstructor> {
    constructor() {
        super(Promise)
    }
}