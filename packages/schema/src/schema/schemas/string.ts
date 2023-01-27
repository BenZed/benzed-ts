
import { isBigInt, isFinite, isNumber, isString } from '@benzed/util'
import { toCamelCase } from '@benzed/string'

import { ValidateContext, ValidationErrorInput } from '../../validator'
import { SubValidator, SubValidatorSettings, ValueValidator } from '../../validators'

import { 
    Schema
} from '../schema'

import { 
    ApplySubValiator
} from '../schema-types'

import { 
    Cast, 
    Type,
    defaultTypeSettings, 
    DefaultTypeSettings, 
    TypeAddSubValidatorSettings
} from './type'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Sub Validators ////

abstract class CaseValidator extends SubValidator<string> {
    constructor(settings: SubValidatorSettings<string>) {
        super({ name: 'case', ...settings })
    }
    override error(): string {
        return `Must be in ${this.name} case`
    }
}

const LowerCase = new class LowerCase extends CaseValidator {
    override transform(input: string): string {
        return input.toLowerCase()
    }
}({ name: 'lower-case' })

const UpperCase = new class UpperCase extends CaseValidator {
    override transform(input: string): string {
        return input.toUpperCase()
    }
}({ name: 'upper-case'})

const CamelCase = new class UpperCase extends CaseValidator {
    override transform(input: string): string {
        return toCamelCase(input)
    }
}({ name: 'camel-case'})

const Trim = new class Trim extends SubValidator<string> {
    override transform(input: string): string {
        return input.trim()
    }
}({ name: 'trimmed' })

class EndsWith extends ValueValidator<string> {
    constructor(value: string, settings?: SubValidatorSettings<string>) {
        super(value, { 
            name: 'ends-with', 
            ...settings 
        })
    }
    override error(): string {
        return `Must end with ${this.value}`
    }
    override isValid(input: string): boolean {
        return input.endsWith(this.value)
    }
}

class StartsWith extends ValueValidator<string> {
    constructor(value: string, settings?: SubValidatorSettings<string>) {
        super(value, settings)
    }
    override error(): string {
        return `Must start with ${this.value}`
    }
    override isValid(input: string): boolean {
        return input.startsWith(this.value)
    }
}

class Includes<T extends { length: number } = string> extends ValueValidator<T> {
    constructor(value: T, settings?: SubValidatorSettings<T>) {
        super(value, { 
            name: 'includes', 
            ...settings 
        })
    }
    equals(input: T, ctx: ValidateContext<T>): boolean {
        void ctx
        return Array.prototype.includes.call(input, this.value)
    }
    override isValid(input: T, ctx: ValidateContext<T>): boolean {
        return this.equals(input, ctx)
    }
}

//// String Validation Defaults ////

const castToString: Cast = (i) => 
    isNumber(i) && isFinite(i) || isBigInt(i)
        ? `${i}`
        : i

//// String Schema Type ////

interface String extends Type<string> {

    get settings(): TypeAddSubValidatorSettings<string, {
        trim: typeof Trim
        lowerCase: typeof LowerCase
        upperCase: typeof UpperCase
        camelCase: typeof CamelCase
        endsWith: typeof EndsWith
        startsWith: typeof StartsWith
        includes: typeof Includes
    }>

    // Make the return type inference nice
    trim: ApplySubValiator<typeof Trim, this>
    lowerCase: ApplySubValiator<typeof LowerCase, this>
    upperCase: ApplySubValiator<typeof UpperCase, this>
    camelCase: ApplySubValiator<typeof CamelCase, this>
    endsWith: ApplySubValiator<typeof EndsWith, this>
    startsWith: ApplySubValiator<typeof StartsWith, this>
    includes: ApplySubValiator<typeof Includes<string>, this>
}

//// String Schema Implementation ////

const $string = new Schema({

    ...defaultTypeSettings as DefaultTypeSettings<string>,

    name: 'string',

    error(): string {
        return `Must be a ${this.name}`
    },

    isValid: isString,
    cast: castToString,

    trim: Trim,
    lowerCase: LowerCase,
    upperCase: UpperCase,
    camelCase: CamelCase,
    endsWith: EndsWith,
    startsWith: StartsWith,
    includes: Includes<string>

}) as String

const $hashTag = $string.startsWith('#', { error: 'Must be a hash-tag' })

//// Exports ////

export {
    String,
}