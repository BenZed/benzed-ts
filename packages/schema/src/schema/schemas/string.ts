
import { toCamelCase } from '@benzed/string'
import { Infer, isBigInt, isFinite, isNumber, isString } from '@benzed/util'
import { AnyValidate, Validator } from '../../validator'

import { 
    Schema
} from '../schema'

import { 
    ApplySubValiator, SchemaSettingsOutput 
} from '../schema-types'

import { 
    Cast, 
    Type,
    defaultTypeSettings, 
    DefaultTypeSettings, 
    ToTypeSettings,
    TypeAddSubValidatorSettings
} from './type'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Sub Validators ////

const caseSettings = {
    id: Symbol('case-validator'),
    name: 'case',
    error() {
        return `Must be in ${this.name} case.`
    }
}

const $lower = new Validator({
    ...caseSettings,
    name: 'lower',
    transform: (i: string) => i.toLowerCase()
})

const $upper = new Validator({
    ...caseSettings,
    name: 'upper',
    transform: (i: string) => i.toUpperCase()
})

const $camel = new Validator({
    ...caseSettings,
    name: 'camel',
    transform: (i: string) => toCamelCase(i)
})

//// String Validation Defaults ////

const castToString: Cast = (i) => 
    isNumber(i) && isFinite(i) || isBigInt(i)
        ? `${i}`
        : i

//// String Schema Type ////

interface String extends Type<string> {

    get settings(): TypeAddSubValidatorSettings<string, {
        lower: typeof $lower
        upper: typeof $upper
        camel: typeof $camel
    }>

    // Make the return type inference nice
    lower: ApplySubValiator<typeof $lower, this>
    upper: ApplySubValiator<typeof $upper, this>
    camel: ApplySubValiator<typeof $camel, this>
}

//// String Schema Implementation ////

const $string: String = new Schema({
    ...defaultTypeSettings as DefaultTypeSettings<string>,

    name: 'string',

    error(): string {
        return `Must be a ${this.name}`
    },

    isValid: isString,
    cast: castToString,

    lower: $lower,
    upper: $upper,
    camel: $camel,
})

//// Exports ////

export {
    String,
    $string,
    $lower
}