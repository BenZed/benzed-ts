import { is } from '@benzed/is'

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

//// Helper ////

function isValidDate(date: unknown): date is Date {
    return is.date(date) && 
        !is.nan(date.getMilliseconds()) 
}

function tryCastToDate(value: unknown): unknown {

    if (is.string(value) || is.number(value) && isValidDate(new Date(value)))
        return new Date(value)

    return value
}

//// Main ////

class DateSchema<F extends Flags[] = []> extends Schema<Date, Date, F> {

    protected _typeValidator = new TypeValidator({
        name: 'date',
        article: 'a',
        is: isValidDate,
        cast: tryCastToDate
    })

    constructor (...flags: F) {
        super( new Date(), ...flags)
    }

    //// Chain Schema Methods ////

    range(...input: RangeValidatorSettingsShortcut<Date>): this {
        return this._copyWithPostTypeValidator(
            'range',
            new RangeValidator(
                toRangeValidatorSettings(input)
            )
        )
    }

}

interface DateSchema<F extends Flags[] = []> {

    readonly optional: HasOptional<
    /**/ F,
    /**/ never,
    /**/ DateSchema<AddFlag<Flags.Optional, F>>
    >

    readonly mutable: HasMutable<
    /**/ F,
    /**/ never,
    /**/ DateSchema<AddFlag<Flags.Mutable, F>>
    >

    readonly clearFlags: () => DateSchema
}

//// Expors ////

export default DateSchema

export {
    DateSchema
}