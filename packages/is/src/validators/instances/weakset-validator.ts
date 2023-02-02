import { InstanceValidator } from '@benzed/schema'

//// Exports ////

export class WeakSetValidator extends InstanceValidator<WeakSetConstructor> {
    constructor() {
        super(WeakSet)
    }
}