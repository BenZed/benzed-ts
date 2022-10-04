import { isDate, isNaN, isNumber, isString } from '@benzed/is'
import { 
    RangeValidator, 
    RangeValidatorSettingsShortcut, 
    toRangeValidatorSettings
} from '../validator/range'

import {
    TypeValidator,
} from '../validator/type'

import {
    AddFlag,
    Flags,
    HasMutable,
    HasOptional
} from './flags'
import Schema from './schema'

/*** Helper ***/

function isValidDate(date: unknown): date is Date {
    return isDate(date) && 
        !isNaN(date.getMilliseconds()) 
}

function tryCastToDate(value: unknown): unknown {

    if (isString(value) || isNumber(value) && isValidDate(new Date(value)))
        return new Date(value)

    return value
}

/*** Main ***/

class DateSchema<F extends Flags[] = []> extends Schema<Date, Date, F> {

    public constructor (defaultValue?: Date, ...flags: F) {
        super(defaultValue ?? new Date(), ...flags)
        this._applyDefaultValue(defaultValue)
    }

    protected _typeValidator = new TypeValidator({
        name: 'date',
        is: isValidDate,
        cast: tryCastToDate
    })

    /*** Chain Schema Methods ***/

    public default(defaultValue: Date): this {
        return super.default(defaultValue)
    }

    public range(...input: RangeValidatorSettingsShortcut<Date>): this {
        return this._copyWithPostTypeValidator(
            'range',
            new RangeValidator(
                toRangeValidatorSettings(input)
            )
        )
    }

    public override readonly optional!: HasOptional<
    /**/ F,
    /**/ () => never,
    /**/ () => DateSchema<AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F,
    /**/ () => never,
    /**/ () => DateSchema<AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => DateSchema

}

/*** Expors ***/

export default DateSchema

export {
    DateSchema
}