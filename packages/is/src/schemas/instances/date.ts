import { isNumber, isString } from '@benzed/util'
import { InstanceValidator } from '../../validators'
import { TypeSchema } from '../type'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/ban-types
*/

//// Main ////

class DateValidator extends InstanceValidator<DateConstructor> {

    constructor() {
        super(globalThis.Date)
    }

    override isValid(value: unknown): value is globalThis.Date {
        return super.isValid(value) && isNumber(value.getTime())
    }

    override cast(input: unknown): unknown {
        if (isNumber(input) || isString(input))
            return new globalThis.Date(input)
        return input
    }

}

class Date extends TypeSchema<DateValidator, {}> {

    constructor() {
        super(new DateValidator, {})
    }

}

//// Exports ////

export { Date }

export const $date = new Date