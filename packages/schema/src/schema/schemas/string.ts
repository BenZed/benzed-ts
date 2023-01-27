
import { isBigInt, isNumber, isString } from '@benzed/util'
import { Validator } from '../../validator'

import { Schema, } from '../schema'
import { ApplySubValidatorInput } from '../schema-types'
import { Cast, defaultTypeSettings, DefaultTypeSettings, Type } from './type'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Types ////

interface String extends Type<string> {
    lower(input?: ApplySubValidatorInput<typeof $lower>): this
}

//// Defaults ////

const castToString: Cast = (input) => 
    isNumber(input) || isBigInt(input)
        ? `${input}`
        : input

//// Validators ////

const $lower = new Validator({
    name: 'lowercase',
    transform: (i: string) => i.toLowerCase()
})

//// Schema ////

const $string: String = new Schema({
    ...defaultTypeSettings as DefaultTypeSettings<string>,
    name: 'string',

    isValid: isString,
    cast: castToString,

    lower: $lower
})

//// Exports ////

export {
    String,
    $string,
    $lower
}