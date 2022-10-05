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

    protected _typeValidator = new TypeValidator({
        name: 'date',
        article: 'a',
        is: isValidDate,
        cast: tryCastToDate
    })

    public constructor (...flags: F) {
        super( new Date(), ...flags)
    }

    /*** Chain Schema Methods ***/

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