import { InstanceValidator } from '@benzed/schema'
//// Exports ////

export class WeakMapValidator extends InstanceValidator<WeakMapConstructor> {
    constructor() {
        super(WeakMap)
    }
}