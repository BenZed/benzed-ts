import { InstanceValidator, Schema } from '@benzed/schema'
import { isNumber, isString } from '@benzed/util'

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

class Date extends Schema<DateValidator, {}> {

    constructor() {
        super(new DateValidator, {})
    }

}

//// Exports ////

export { Date }

export const $date = new Date