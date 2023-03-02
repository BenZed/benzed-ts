import { ValueSchema, ValueValidator } from '@benzed/schema'
import { Primitive } from '@benzed/util'

//// Exports ////

export class Value<T extends Primitive> extends ValueSchema<ValueValidator<T>> {

    constructor(value: T) {
        super(
            new ValueValidator(value),
            {}
        )
    }

    get value(): T {
        return this[ValueSchema.main].value
    }

}
