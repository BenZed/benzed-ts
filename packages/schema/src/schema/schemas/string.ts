
import { isBigInt, isFinite, isNumber, isString } from '@benzed/util'
import { capitalize, toCamelCase } from '@benzed/string'

import { ValidateContext, ValidationErrorInput } from '../../validator'
import { SubValidator, ValueValidator } from '../../validators'

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
    TypeAddSubValidatorSettings
} from './type'
import { $$id } from '../../symbols'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Symbol Ids ////

const $$case = Symbol('case-validator')

//// Sub Validators ////

abstract class CaseValidator extends SubValidator<string> {
    /**
     * @internal
     */
    readonly [$$id]: symbol = this[$$id] || $$case

    override error(): string {
        return `Must be in ${this.name} case `
    }
}

const Lower = new class Lower extends CaseValidator {
    override transform(input: string): string {
        return input.toLowerCase()
    }
}

const Upper = new class Upper extends CaseValidator {
    override transform(input: string): string {
        return input.toUpperCase()
    }
}

const Camel = new class Camel extends CaseValidator {
    override transform(input: string): string {
        return toCamelCase(input)
    }
}

const Trim = new class Trimmed extends SubValidator<string> {
    override transform(input: string): string {
        return input.trim()
    }
}

const Capitalize = new class Capitalized extends CaseValidator {
    override transform(input: string): string {
        return capitalize(input)
    }

    override error(): string {
        return `Must be ${this.name}`
    }
}

class EndsWith extends ValueValidator<string> {
    constructor(
        value: string, 
        error?: ValidationErrorInput<string>, 
        name = `ends-with-${value}`
    ) {
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
    constructor(
        value: string, 
        error?: ValidationErrorInput<string>, 
        name = `starts-with-${value}`
    ) {
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
    constructor(
        value: T,
        error?: ValidationErrorInput<T>, 
        name = `includes-${value}`
    ) {
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
        lowerCase: typeof Lower
        upperCase: typeof Upper
        camelCase: typeof Camel
        endsWith: typeof EndsWith
        startsWith: typeof StartsWith
        includes: typeof Includes
    }>

    // Make the return type inference nice
    trim: ApplySubValiator<typeof Trim, this>
    capitalize: ApplySubValiator<typeof Capitalize, this>
    lowerCase: ApplySubValiator<typeof Lower, this>
    upperCase: ApplySubValiator<typeof Upper, this>
    camelCase: ApplySubValiator<typeof Camel, this>
    endsWith: ApplySubValiator<typeof EndsWith, this>
    startsWith: ApplySubValiator<typeof StartsWith, this>
    includes: ApplySubValiator<typeof Includes<string>, this>
    // length: ApplySubValiator<typeof Length<string>, this>
}

//// String Schema Implementation ////

export default new Schema({

    ...defaultTypeSettings,

    name: 'string',

    isValid: isString,
    cast: castToString,

    trim: Trim,
    capitalize: Capitalize,
    lowerCase: Lower,
    upperCase: Upper,
    camelCase: Camel,
    endsWith: EndsWith,
    startsWith: StartsWith,
    includes: Includes<string>
    // length: Length<string>

}) as String

//// Exports ////

export {
    String,
}