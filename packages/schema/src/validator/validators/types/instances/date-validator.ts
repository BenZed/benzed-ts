import { isNumber } from '@benzed/util'
import ValidationContext from '../../../../validation-context'
import InstanceValidator from '../instance-validator'

//// Exports ////

export class DateValidator extends InstanceValidator<DateConstructor> {

    constructor() {
        super(Date)
    }

    override cast(input: unknown, ctx: ValidationContext<unknown>): unknown {
        if (isNumber(input))
            return new Date(input)
    }
}