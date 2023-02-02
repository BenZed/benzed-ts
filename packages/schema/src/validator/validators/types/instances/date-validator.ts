import { isNumber, isString } from '@benzed/util'

import InstanceValidator from '../instance-validator'

//// Exports ////

export class DateValidator extends InstanceValidator<DateConstructor> {

    constructor() {
        super(Date)
    }

    override isValid(value: unknown): value is Date {
        return super.isValid(value) && isNumber(value.getTime())
    }

    override cast(input: unknown): unknown {
        if (isNumber(input) || isString(input))
            return new Date(input)

        return input
    }

}