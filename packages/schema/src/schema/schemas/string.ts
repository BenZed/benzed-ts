
import { isBigInt, isFinite, isNumber, isString } from '@benzed/util'
import { capitalize, toCamelCase } from '@benzed/string'

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

//// Symbols ////

const $$case = Symbol('case-validator')

//// Sub Validators ////

abstract class CaseValidator extends SubValidator<string> {
    constructor(settings: SubValidatorSettings<string>) {
        super({ name: 'case', ...settings, id: $$case })
    }
    override error(): string {
        return `Must be in ${this.name} case`
    }
}

const LowerCase = new class LowerCase extends CaseValidator {
    override transform(input: string): string {
        return input.toLowerCase()
    }
}({ name: 'lower' })

const UpperCase = new class UpperCase extends CaseValidator {
    override transform(input: string): string {
        return input.toUpperCase()
    }
}({ name: 'upper'})

const CamelCase = new class CamelCase extends CaseValidator {
    override transform(input: string): string {
        return toCamelCase(input)
    }
}({ name: 'camel'})

const Trim = new class Trim extends SubValidator<string> {
    override transform(input: string): string {
        return input.trim()
    }
}({ name: 'trimmed' })

const Capitalize = new class Capitalize extends CaseValidator {
    override transform(input: string): string {
        return capitalize(input)
    }
}({ 
    name: 'capitalized', 
    error() {
        return `Must be ${this.name}` 
    } 
})

class EndsWith extends ValueValidator<string> {
    constructor(value: string, error?: ValidationErrorInput<string>, name = `ends-with-${value}`) {
        super(value, { error, name })
    }
    override error(): string {
        return `Must end with ${this.value}`
    }
    override transform(input: string): string {
        return input.endsWith(this.value) ? input : input + this.value 
    }
}

class StartsWith extends ValueValidator<string> {
    constructor(value: string, error?: ValidationErrorInput<string>, name = `starts-with-${value}`) {
        super(value, { error, name })
    }
    override error(): string {
        return `Must start with ${this.value}`
    }
    override transform(input: string): string {
        return input.startsWith(this.value) ? input : this.value + input
    }
}

class Includes<T extends { length: number } = string> extends ValueValidator<T> {
    constructor(value: T, error?: ValidationErrorInput<T>, name = `includes-${value}`) {
        super(value, { name, error })
    }
    override error(): string {
        return `Must include ${this.value}`
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
        capitalize: typeof Capitalize
        lowerCase: typeof LowerCase
        upperCase: typeof UpperCase
        camelCase: typeof CamelCase
        endsWith: typeof EndsWith
        startsWith: typeof StartsWith
        includes: typeof Includes
    }>

    // Make the return type inference nice
    trim: ApplySubValiator<typeof Trim, this>
    capitalize: ApplySubValiator<typeof Capitalize, this>
    lowerCase: ApplySubValiator<typeof LowerCase, this>
    upperCase: ApplySubValiator<typeof UpperCase, this>
    camelCase: ApplySubValiator<typeof CamelCase, this>
    endsWith: ApplySubValiator<typeof EndsWith, this>
    startsWith: ApplySubValiator<typeof StartsWith, this>
    includes: ApplySubValiator<typeof Includes<string>, this>
}

//// String Schema Implementation ////

export default new Schema({

    ...defaultTypeSettings as DefaultTypeSettings<string>,

    name: 'string',

    error(): string {
        return `Must be a ${this.name}`
    },

    isValid: isString,
    cast: castToString,

    trim: Trim,
    capitalize: Capitalize,
    lowerCase: LowerCase,
    upperCase: UpperCase,
    camelCase: CamelCase,
    endsWith: EndsWith,
    startsWith: StartsWith,
    includes: Includes<string>

}) as String

//// Exports ////

export {
    String,
}